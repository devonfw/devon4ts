import { User } from '../../src/user/models/user.entity';
import { BaseService } from '../../src/shared/base.service';
import { RegisterVm } from '../../src/user/models/view-models/register-vm.model';
import { LoginVm } from '../../src/user/models/view-models/login-vm.model';
import { LoginResponseVm } from '../../src/user/models/view-models/login-response-vm.model';
import { UserVm } from '../../src/user/models/view-models/user-vm.model';
import { ChangePasswordVm } from '../../src/user/models/view-models/change-password-vm.model';
import { AuthServiceMock } from './auth.service.mock';
import { Repository } from 'typeorm';

export class UserServiceMock extends BaseService<User> {
  constructor(
    private readonly _userRepository: Repository<User>,
    private readonly _authService: AuthServiceMock,
  ) {
    super();
    this._repository = _userRepository;
  }

  async register(registerVm: RegisterVm): Promise<User> {
    const result: User = {
      id: 1,
      username: registerVm.username,
      mail: registerVm.mail,
      password: registerVm.password,
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => null,
      remove: () => null,
      reload: null,
    };
    return result;
  }

  async login(loginVm: LoginVm): Promise<LoginResponseVm> {
    const usermock: UserVm = {
      username: loginVm.username,
      mail: 'mail@test.com',
    };
    const result: LoginResponseVm = { token: 'LoginToken', user: usermock };
    return result;
  }

  async changePassword(object: ChangePasswordVm): Promise<User> {
    return {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: object.newPassword,
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => null,
      remove: () => null,
      reload: null,
    };
  }

  async passwordMatch(input: string, password: string): Promise<boolean> {
    return input === password;
  }

  async find(filter = {}): Promise<User> {
    return await this._userRepository.findOne(filter).catch(err => {
      return null;
    });
  }

  async getUserId(input = {}): Promise<number> {
    const exists = await this.find(input);
    if (exists) return exists.id;
    return -1;
  }
}
