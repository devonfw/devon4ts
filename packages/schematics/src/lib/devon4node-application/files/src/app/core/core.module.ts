import { ClassSerializerInterceptor, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonLogger } from '../shared/logger/winston.logger';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, WinstonLogger],
  exports: [WinstonLogger],
})
export class CoreModule {}
