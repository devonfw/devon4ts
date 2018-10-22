import { User } from '../../src/user/models/user.entity';
import { BaseService } from '../../src/shared/base.service';
import { RegisterVm } from '../../src/user/models/view-models/register-vm.model';
import { LoginVm } from '../../src/user/models/view-models/login-vm.model';
import { LoginResponseVm } from '../../src/user/models/view-models/login-response-vm.model';
import { UserVm } from '../../src/user/models/view-models/user-vm.model';
import { ChangePasswordVm } from '../../src/user/models/view-models/change-password-vm.model';
import { UserRepository } from '../../src/user/user.repository';

export class UserServiceMock extends BaseService<User> {
  constructor() {
    super();
    this._repository = new UserRepository();
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

  async update(id: number, user: UserVm): Promise<User> {
    let roleUpdated = 'User';
    if (user.role) {
      roleUpdated = user.role;
    }
    return {
      id: 1,
      username: 'test',
      mail: user.mail,
      password: 'test',
      role: roleUpdated,
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => null,
      remove: () => null,
      reload: null,
    };
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
    const result: User = {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: 'test',
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

  async findById(id: number): Promise<User> {
    const result: User = {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: 'test',
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => null,
      remove: () => null,
      reload: null,
    };
    if (id === 1) return result;
  }

  async getUserId(input = {}): Promise<number> {
    const exists = await this.find(input);
    if (exists) return exists.id;
    return -1;
  }
}
