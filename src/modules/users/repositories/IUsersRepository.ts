import User from '../infra/typeorm/entities/User';
import CreateUserDTO from '../dtos/CreateUserDTO';

export default interface IUsersRepository {
  create(data: CreateUserDTO): User;
  save(user: User): Promise<User>;
  findByUserId(user_id: number): Promise<User | undefined>;
  findByTelegramId(telegram_id: number): Promise<User | undefined>;
  getUsersWithMentions(): Promise<User[]>;
  getUsersWithMerits(): Promise<User[]>;
}
