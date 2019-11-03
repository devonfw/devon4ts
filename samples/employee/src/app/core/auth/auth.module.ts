import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers';
import { AuthService } from './services';
import { JwtStrategy } from './strategies';
import { ConfigurationModule } from '../configuration/configuration.module';
import { ConfigurationService } from '../configuration/services';

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
