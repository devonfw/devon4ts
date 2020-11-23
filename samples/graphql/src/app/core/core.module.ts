import { Global, Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@devon4node/common/serializer';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonLogger } from '../shared/logger/winston.logger';
import { BusinessLogicFilter } from '../shared/filters/business-logic.filter';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: BusinessLogicFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    WinstonLogger,
  ],
  exports: [WinstonLogger],
})
export class CoreModule {}
