import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigurationService } from '../../configuration/services';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(<% if (config) { %>public readonly configService: ConfigurationService <% } %>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: <% if(config) { %> configService.jwtConfig.secret <% } else { %> 'SECRET' <% } %>,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
