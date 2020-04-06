import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@devon4node/config';
import { Config } from '../../../shared/model/config/config.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(public readonly configService: ConfigService<Config>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.values.jwtConfig.secret,
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
