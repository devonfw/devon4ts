import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { Configuration } from '../configuration/configuration.enum';
import { ConfigurationService } from '../configuration/configuration.service';
import { SignOptions, sign } from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload';
import { User } from '../../user/models/user.entity';

@Injectable()
export class AuthService {
  private readonly jwtOptions: SignOptions;
  private readonly jwtKey: string | undefined;

  constructor(
    @Inject(forwardRef(() => UserService)) readonly _userService: UserService,
    private readonly _configurationService: ConfigurationService,
  ) {
    this.jwtOptions = { expiresIn: '8h' };
    this.jwtKey = _configurationService.get(Configuration.JWT_KEY);
  }

  async signPayload(payload: JwtPayload): Promise<string> {
    return sign(payload, this.jwtKey, this.jwtOptions);
  }
  async validatePayload(payload: JwtPayload): Promise<User | null> {
    const username = payload.username;
    return await this._userService.find({ username });
  }
}
