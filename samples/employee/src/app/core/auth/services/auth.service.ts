import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { classToPlain } from 'class-transformer';
import { UserService } from '../../user/services';
import { User } from '../../user/model';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<User | undefined> {
    const user = await this.usersService.findOne(username);
    if (user && (await compare(pass, user.password!))) {
      return classToPlain(user) as User;
    }
    return undefined;
  }

  async login(user: User): Promise<string> {
    const payload = await this.validateUser(user.username!, user.password!);

    if (!payload) {
      throw new UnauthorizedException('Wrong username or password');
    }

    return this.jwtService.sign(payload);
  }

  register(user: User) {
    return this.usersService.registerUser(user);
  }
}
