import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtStrategyService } from './auth/strategies/jwt-strategy.service';
import { ConfigurationModule } from './configuration/configuration.module';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  providers: [AuthService, JwtStrategyService],
  exports: [AuthService],
  imports: [UserModule, ConfigurationModule],
})
export class SharedModule {}
