import { ChangePasswordDTO } from '../../src/shared/user/models/dto/change-password.dto';
import { LoginResponseDTO } from '../../src/shared/auth/model/login-response.dto';
import { LoginDTO } from '../../src/shared/auth/model/login.dto';
import { RegisterDTO } from '../../src/shared/auth/model/register.dto';
import { UserDTO } from '../../src/shared/user/models/dto/user.dto';
import { UserRole } from '../../src/shared/user/models/user-role.enum';
import { User } from '../../src/shared/user/models/user.entity';

export class UserServiceMock {
  async register(register: RegisterDTO): Promise<User> {
    const result: User = {
      id: 1,
      username: register.username,
      mail: register.mail,
      password: register.password,
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => new Promise<User>(resolve => resolve(undefined)),
      remove: () => new Promise<User>(resolve => resolve(undefined)),
      reload: () =>
        new Promise<void>(() => {
          // nothing to do here
        }),
    };
    return result;
  }

  async login(login: LoginDTO): Promise<LoginResponseDTO> {
    const usermock: UserDTO = {
      username: login.username,
      mail: 'mail@test.com',
    };
    const result: LoginResponseDTO = { token: 'LoginToken', user: usermock };
    return result;
  }

  async update(_id: number, user: UserDTO): Promise<User> {
    let roleUpdated: string = UserRole.User;
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
      save: () => new Promise<User>(resolve => resolve(undefined)),
      remove: () => new Promise<User>(resolve => resolve(undefined)),
      reload: () =>
        new Promise<void>(() => {
          // nothing to do here
        }),
    };
  }
  async changePassword(object: ChangePasswordDTO): Promise<User> {
    return {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: object.newPassword,
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => new Promise<User>(resolve => resolve(undefined)),
      remove: () => new Promise<User>(resolve => resolve(undefined)),
      reload: () =>
        new Promise<void>(() => {
          // nothing to do here
        }),
    };
  }

  async passwordMatch(input: string, password: string): Promise<boolean> {
    return input === password;
  }

  async find(_filter = {}): Promise<User> {
    const result: User = {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: 'test',
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => new Promise<User>(resolve => resolve(undefined)),
      remove: () => new Promise<User>(resolve => resolve(undefined)),
      reload: () =>
        new Promise<void>(() => {
          // nothing to do here
        }),
    };
    return result;
  }

  async findById(id: number): Promise<User | undefined> {
    const result: User = {
      id: 1,
      username: 'test',
      mail: 'test@mail.com',
      password: 'test',
      role: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
      hasId: () => true,
      save: () => new Promise<User>(resolve => resolve(undefined)),
      remove: () => new Promise<User>(resolve => resolve(undefined)),
      reload: () =>
        new Promise<void>(() => {
          // nothing to do here
        }),
    };
    if (id === 1) {
      return result;
    }

    return undefined;
  }

  async getUserId(input = {}): Promise<number> {
    const exists = await this.find(input);
    if (exists) {
      return exists.id;
    }
    return -1;
  }
}
