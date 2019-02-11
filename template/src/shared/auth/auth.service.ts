import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/models/user.entity';
import { LoginResponseDTO } from './model/login-response.dto';
import { LoginDTO } from './model/login.dto';
import { UserService } from '../user/user.service';
import { JwtPayload } from './model/jwt-payload.interface';
import { RegisterDTO } from './model/register.dto';
import { UserDTO } from '../user/models/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(login: LoginDTO): Promise<LoginResponseDTO> {
    try {
      const user = await this.validateUser(login);
      if (!user) {
        throw new HttpException(
          'Invalid login or password.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const payload: JwtPayload = {
        username: user.username,
        role: user.role,
      };

      let token: string;
      try {
        token = this.signPayload(payload);
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      const { id, password, ...rest } = user;
      return {
        token,
        user: {
          username: rest.username,
          mail: rest.mail,
          role: rest.role,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async register(newUserData: RegisterDTO): Promise<UserDTO> {
    try {
      newUserData = this.transformRegister(newUserData);
      const newUser = await this.userService.register(newUserData);
      const { id, password, ...result } = newUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  private signPayload(user: JwtPayload): string {
    return this.jwtService.sign(user);
  }

  async validateUser(payload: LoginDTO): Promise<User | undefined> {
    const user = await this.userService.find({ username: payload.username });

    if (
      user &&
      this.userService.passwordMatch(payload.password, user.password)
    ) {
      return user;
    }
    return undefined;
  }

  private transformRegister(register: RegisterDTO): RegisterDTO {
    register.role = 'User';
    register.username = register.username.toLowerCase();
    register.mail = register.mail.toLowerCase();
    return register;
  }
}
