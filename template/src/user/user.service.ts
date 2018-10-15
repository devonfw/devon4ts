import {
  Injectable,
  forwardRef,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../shared/base.service';
import { RegisterVm } from './models/view-models/register-vm.model';
import { genSalt, hash, compare } from 'bcryptjs';
import { LoginVm } from './models/view-models/login-vm.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { AuthService } from '../shared/auth/auth.service';
import { JwtPayload } from '../shared/auth/jwt-payload';
import { ChangePasswordVm } from './models/view-models/change-password-vm.model';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly _userRepository: Repository<User>,
    @Inject(forwardRef(() => AuthService)) readonly _authService: AuthService,
  ) {
    super();
    this._repository = _userRepository;
  }

  async register(registerVm: RegisterVm): Promise<User> {
    const { username, password, mail } = registerVm;
    try {
      let exist = await this._userRepository
        .findOne({ username })
        .catch(err => {
          throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
        });
      if (exist) {
        throw new HttpException(
          `${username} is already in use`,
          HttpStatus.BAD_REQUEST,
        );
      }

      exist = await this._userRepository.findOne({ mail }).catch(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
      if (exist) {
        throw new HttpException(
          `This mail is already associated with an username`,
          HttpStatus.BAD_REQUEST,
        );
      }
      const newUser = this._userRepository.create(registerVm);
      const salt = await genSalt();
      newUser.password = await hash(password, salt);
      const result = await this._userRepository.save(newUser).catch(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
      return result;
    } catch (e) {
      throw new HttpException(e, e.getStatus());
    }
  }

  async login(loginVm: LoginVm): Promise<LoginResponseVm> {
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
      throw new HttpException(error, error.getStatus());
    }
  }

  async changePassword(user: ChangePasswordVm): Promise<User> {
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
      const result = await this.update(exist.id, exist).catch(err => {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      });
      if (!result)
        throw new HttpException(
          'An unexpected error has ocurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      return result;
    } catch (e) {
      throw new HttpException(e, e.getStatus());
    }
  }

  async passwordMatch(input: string, password: string): Promise<boolean> {
    return await compare(input, password).catch(err => {
      return false;
    });
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
