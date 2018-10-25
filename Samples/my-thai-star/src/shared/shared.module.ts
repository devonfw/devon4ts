import { Module, Global } from '@nestjs/common';
import { ConfigurationService } from './configuration/configuration.service';
import { UserModule } from '../management/user/user.module';
import { AuthService } from './auth/auth.service';
import { JwtStrategyService } from './auth/strategies/jwt-strategy.service';
import { AuthController } from './auth/auth.controller';

@Global()
@Module({
  providers: [ConfigurationService, AuthService, JwtStrategyService],
  exports: [ConfigurationService, AuthService],
  imports: [UserModule],
  controllers: [AuthController],
})
export class SharedModule {}
