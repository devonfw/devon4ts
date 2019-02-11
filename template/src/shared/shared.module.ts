import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Global()
@Module({
  providers: [],
  exports: [],
  imports: [AuthModule, ConfigurationModule],
})
export class SharedModule {}
