import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, genSalt, hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { AuthService } from '../shared/auth/auth.service';
import { JwtPayload } from '../shared/auth/jwt-payload';
import { ChangePasswordDTO } from './models/dto/change-password.dto';
import { LoginResponseDTO } from './models/dto/login-response.dto';
import { LoginDTO } from './models/dto/login.dto';
import { RegisterDTO } from './models/dto/register.dto';
import { User } from './models/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService)) readonly _authService: AuthService,
  ) {}

  async register(registerVm: RegisterDTO): Promise<User> {
    const { username, password, mail } = registerVm;
    try {
      let exist = await this._userRepository.findOne({ username });
      if (exist) {
        throw new HttpException(
          `${username} is already in use`,
          HttpStatus.BAD_REQUEST,
        );
      }

      exist = await this._userRepository.findOne({ mail });
      if (exist) {
        throw new HttpException(
          `This mail is already associated with an username`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const newUser = this._userRepository.create(registerVm);
      const salt = await genSalt();
      newUser.password = await hash(password, salt);
      const result = await this._userRepository.save(newUser);
      return result;
    } catch (e) {
      throw e;
    }
  }

  async login(loginVm: LoginDTO): Promise<LoginResponseDTO> {
    try {
      const { username } = loginVm;
      const user = await this._userRepository.findOne({ username });
      if (!user) {
        throw new HttpException('Username not found', HttpStatus.BAD_REQUEST);
      }

      if (!(await this.passwordMatch(loginVm.password, user.password))) {
        throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
      }

      const payload: JwtPayload = {
        username: user.username,
        role: user.role,
      };

      const token = await this._authService.signPayload(payload).catch(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
      const { id, password, ...userVm } = user;
      return {
        token,
        user: userVm,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(user: ChangePasswordDTO): Promise<User> {
    try {
      const { username, password, newPassword } = user;

      const exist = await this._userRepository.findOne({ username });
      if (!exist) {
        throw new HttpException(
          `No User found with the provided username: ${username}`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (!(await this.passwordMatch(password, exist.password))) {
        throw new HttpException('Wrong password', HttpStatus.BAD_REQUEST);
      }

      if (password !== newPassword && newPassword.length >= 6) {
        const salt = await genSalt();
        exist.password = await hash(newPassword, salt);
      } else {
        throw new HttpException(
          'The new password must have at least 6 characters and must be different from the previous one',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result = await this.update(exist.id, exist);
      if (!result) {
        throw new HttpException(
          'An unexpected error has ocurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return result;
    } catch (e) {
      throw e;
    }
  }

  async passwordMatch(input: string, password: string): Promise<boolean> {
    return await compare(input, password);
  }

  async find(filter = {}): Promise<User | undefined> {
    return await this._userRepository.findOne(filter).catch(_err => {
      return undefined;
    });
  }

  async getUserId(input = {}): Promise<number> {
    const exists = await this.find(input);
    if (exists) {
      return exists.id;
    }
    return -1;
  }

  async findAll(filter = {}) {
    return await this._userRepository.find(filter);
  }
  async findById(id: any) {
    return await this._userRepository.findOne(id);
  }
  async delete(item: User) {
    const exists = await this._userRepository.findOne(item);
    if (exists) {
      return await this._userRepository.remove(item);
    }
    return exists;
  }
  async deleteById(id: any) {
    const exists = await this._userRepository.findOne(id);
    if (exists) {
      return await this._userRepository.remove(exists);
    }
    return exists;
  }
  async update(id: any, item: Partial<User>) {
    const exists = await this._userRepository.findOne(id);
    if (exists) {
      await this._userRepository.update(id, item);
    }
    return exists;
  }
}
