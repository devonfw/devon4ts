import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/services/configuration.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigurationModule],
      useFactory: (config: ConfigurationService) => config.jwtConfig,
      inject: [ConfigurationService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
