import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from '~app/core/auth/controllers/auth.controller';
import { AuthService } from '~app/core/auth/services/auth.service';
import { JwtStrategy } from '~app/core/auth/strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@devon4node/config';
import { Config } from '~app/shared/model/config/config.model';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<Config>) => config.values.jwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule],
  controllers: [AuthController],
})
export class AuthModule { }
