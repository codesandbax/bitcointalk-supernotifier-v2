export default interface IFindPostsConditionsDTO {
  author?: string;
  author_uid?: number;
  content?: string;
  topic_id?: number;
  board?: number;
  child_boards?: boolean;
  last?: number;
  after?: number;
  after_date?: string;
  before_date?: string;
  limit: number;
  order?: 'ASC' | 'DESC';
}
