import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { classToPlain, plainToClass } from 'class-transformer';
import { UserService } from '../../user/services/user.service';
import { User } from '../../user/model/entities/user.entity';
import { LoginDTO } from '../model/login.dto';
import { CreateUserDto } from '../../user/model/dto/create-user.dto';

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

  async login(user: LoginDTO): Promise<string> {
    const payload = await this.validateUser(user.username!, user.password!);

    if (!payload) {
      throw new UnauthorizedException('Wrong username or password');
    }

    return this.jwtService.sign(payload);
  }

  register(user: CreateUserDto): Promise<User> {
    return this.usersService.registerUser(plainToClass(User, user));
  }
}
