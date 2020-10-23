import { container } from 'tsyringe';
import { Request, Response } from 'express';
import Joi from 'joi';

import logger from '../../../services/logger';

import IFindPostsConditionsDTO from '../../../../modules/posts/dtos/IFindPostsConditionsDTO';

import GetPostsAuthorsService from '../services/GetPostsAuthorsService';

export default class PostsAuthorsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const getPosts = container.resolve(GetPostsAuthorsService);

    const schemaValidation = Joi.object({
      author: Joi.string().allow('', null),
      content: Joi.string().allow('', null),
      topic_id: Joi.number().allow('', null),
      board: Joi.number().allow('', null),
      after_date: Joi.string().isoDate().allow('', null),
      before_date: Joi.string().isoDate().allow('', null),
    });

    const query = request.query as unknown;

    try {
      await schemaValidation.validateAsync(query);
    } catch (error) {
      return response.status(400).json({
        result: 'fail',
        message: error.details[0].message,
        data: null,
      });
    }

    try {
      const data = await getPosts.execute(query as IFindPostsConditionsDTO);

      const result = {
        result: 'success',
        message: null,
        data,
      };

      return response.json(result);
    } catch (error) {
      logger.error(
        { error: error.message, stack: error.stack },
        'Error on PostsAuthorsController',
      );
      return response
        .status(500)
        .json({ result: 'fail', message: 'Something went wrong', data: null });
    }
  }
}
