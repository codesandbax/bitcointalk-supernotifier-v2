import esClient from '../../../services/elastic';

import IFindPostsConditionsDTO from '../../../../modules/posts/dtos/IFindPostsConditionsDTO';

import GetBoardChildrensFromIdService from '../../../../modules/posts/services/GetBoardChildrensFromIdService';

interface Author {
  author: string;
  author_uid: number;
  count: number;
}

interface Data {
  total_results: number;
  authors: Author[];
}

export default class GetAddressAuthorsService {
  public async execute(query: IFindPostsConditionsDTO): Promise<Data> {
    const {
      author,
      author_uid,
      content,
      topic_id,
      board,
      child_boards,
      after_date,
      before_date,
    } = query || {};

    const must = [];

    if (author) {
      must.push({
        match: {
          author,
        },
      });
    }

    if (author_uid) {
      must.push({
        match: {
          author_uid,
        },
      });
    }

    if (content) {
      must.push({
        match: {
          content: {
            query: content,
            minimum_should_match: '100%',
          },
        },
      });
    }

    if (topic_id) {
      must.push({ match: { topic_id } });
    }

    if (after_date || before_date) {
      must.push({
        range: { date: { gte: after_date || null, lte: before_date || null } },
      });
    }

    if (board) {
      if (child_boards) {
        const getBoardChildrensFromId = new GetBoardChildrensFromIdService();
        const boards = await getBoardChildrensFromId.execute(board);

        must.push({ terms: { board_id: boards } });
      } else {
        must.push({ terms: { board_id: [board] } });
      }
    }

    const results = await esClient.search({
      index: 'posts_addresses',
      track_total_hits: true,
      size: 0,
      body: {
        query: {
          bool: {
            must,
          },
        },
        aggs: {
          authors: {
            terms: {
              field: 'author.keyword',
              size: 1000,
            },
            aggs: {
              author_uid: {
                terms: {
                  field: 'author_uid',
                },
              },
            },
          },
        },
      },
    });

    const authors = results.body.aggregations.authors.buckets.map(record => {
      return {
        author: record.key,
        author_uid: record.author_uid.buckets[0].key,
        count: record.doc_count,
      };
    });

    const response = {
      total_results: results.body.hits.total.value,
      authors,
    };

    return response;
  }
}
