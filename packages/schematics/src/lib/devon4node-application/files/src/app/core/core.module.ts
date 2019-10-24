import { Global, Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@devon4node/common/serializer';
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
