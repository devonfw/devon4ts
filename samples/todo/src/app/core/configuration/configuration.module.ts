import { Module } from '@nestjs/common';
import { ConfigurationService } from './services';

@Module({
  providers: [ConfigurationService],
  exports: [ConfigurationService],
})
export class ConfigurationModule {}
