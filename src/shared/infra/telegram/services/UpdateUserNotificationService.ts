import { injectable, inject } from 'tsyringe';
import User from '../../../../modules/users/infra/schemas/User';

import IUsersRepository from '../../../../modules/users/repositories/IUsersRepository';

type NotificationType = 'mentions' | 'merits';

@injectable()
export default class UpdateUserNotificationService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute(
    telegram_id: number,
    type: NotificationType,
    value: boolean,
  ): Promise<User> {
    const user = await this.usersRepository.findByTelegramId(telegram_id);

    if (type === 'mentions') {
      user.enable_mentions = value;
    } else if (type === 'merits') {
      user.enable_merits = value;
    }

    await this.usersRepository.save(user);

    return user;
  }
}
