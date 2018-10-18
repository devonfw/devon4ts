import { User } from '../../src/user/models/user.entity';
import { BaseService } from '../../src/shared/base.service';
import { UserRepository } from '../../src/user/user.repository';

export class UserServiceMock extends BaseService<User> {
  constructor(private readonly _userRepository: UserRepository) {
    super();
    this._repository = _userRepository;
  }
}
