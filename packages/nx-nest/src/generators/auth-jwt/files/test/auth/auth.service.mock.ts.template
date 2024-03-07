import { User } from '../../src/app/core/user/model/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
export class AuthServiceMock {
  private user: Partial<User> = {
    id: 1,
    username: 'user1',
    password: 'user1',
    role: 0,
  };

  async validateUser(username: string, pass: string): Promise<User | undefined> {
    if (username === this.user.username && pass === this.user.password) {
      return this.user as User;
    }

    return undefined;
  }

  async login(user: User): Promise<string> {
    if (!(await this.validateUser(user.username, user.password))) {
      throw new UnauthorizedException('Wrong username or password');
    }

    return 'THISISNOTAJWTTOKEN';
  }

  register(user: User): Partial<User> {
    if (user.username === this.user.username) {
      throw new Error('User already exists');
    }

    return { ...user, password: undefined };
  }
}
