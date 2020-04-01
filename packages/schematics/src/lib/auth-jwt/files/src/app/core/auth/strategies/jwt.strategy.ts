import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
<% if (config) { %>import { ConfigService } from '@devon4node/config';
import { Config } from '../../../shared/model/config/config.model';<% } %>

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(<% if (config) { %>public readonly configService: ConfigService<Config> <% } %>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: <% if(config) { %> configService.values.jwtConfig.secret <% } else { %> 'SECRET' <% } %>,
    });
  }

  async validate(payload: any): Promise<any> {
    return payload;
  }
}
