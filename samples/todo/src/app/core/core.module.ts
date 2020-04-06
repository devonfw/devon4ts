import { Global, Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@devon4node/common/serializer';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonLogger } from '../shared/logger/winston.logger';
import { BusinessLogicFilter } from '../shared/filters/business-logic.filter';
import { ConfigModule, ConfigService } from '@devon4node/config';
import { Config } from '../shared/model/config/config.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Global()
@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<Config>) => {
        return config.values.database;
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      configPrefix: 'devon4node',
      configType: Config,
    }),
  ],
  controllers: [],
  providers: [
    { provide: APP_FILTER, useClass: BusinessLogicFilter },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
    WinstonLogger,
  ],
  exports: [UserModule, AuthModule, ConfigModule, WinstonLogger],
})
export class CoreModule {}
