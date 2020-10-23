import { container } from 'tsyringe';

import esClient from '../../../shared/services/elastic';

import GetCacheService from '../../../shared/container/providers/services/GetCacheService';
import SaveCacheService from '../../../shared/container/providers/services/SaveCacheService';
import GetAuthorInfoService from '../../../shared/infra/http/services/GetAuthorInfoService';

interface Params {
  username: string;
  from: string;
  to: string;
  interval: string;
}

interface Data {
  key_as_string: string;
  key: number;
  doc_count: number;
}

export default class GetUserPostsOnPeriodService {
  public async execute({
    username,
    from,
    to,
    interval,
  }: Params): Promise<Data> {
    const getCache = container.resolve(GetCacheService);
    const saveCache = container.resolve(SaveCacheService);
    const getAuthorInfo = container.resolve(GetAuthorInfoService);

    const cachedData = await getCache.execute<Data>(
      `userPostsOnPeriod:${username}:${from}-${to}-${interval}`,
    );

    if (cachedData) {
      return cachedData;
    }

    const authorInfo = await getAuthorInfo.execute({ username });

    const results = await esClient.search({
      index: 'posts',
      scroll: '1m',
      _source: ['author', 'author_uid'],
      size: 1,
      body: {
        size: 1,
        _source: ['author', 'author_uid'],
        query: {
          bool: {
            must: [
              {
                match: {
                  author_uid: authorInfo.author_uid,
                },
              },
              {
                range: {
                  date: {
                    from,
                    to,
                  },
                },
              },
            ],
          },
        },
        aggs: {
          posts: {
            value_count: {
              field: 'post_id',
            },
          },
          date: {
            date_histogram: {
              field: 'date',
              fixed_interval: interval,
              extended_bounds: {
                min: from,
                max: to,
              },
            },
          },
        },
      },
    });

    const data = results.body.aggregations.date.buckets;

    await saveCache.execute(
      `userPostsOnPeriod:${username}:${from}-${to}-${interval}`,
      data,
      'EX',
      180,
    );

    return data;
  }
}
