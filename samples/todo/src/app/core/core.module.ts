import { Global, Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@devon4node/common/serializer';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { WinstonLogger } from '~app/shared/logger/winston.logger';
import { BusinessLogicFilter } from '~app/shared/filters/business-logic.filter';
import { ConfigModule, ConfigService } from '@devon4node/config';
import { Config } from '~app/shared/model/config/config.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '~app/core/auth/auth.module';
import { UserModule } from '~app/core/user/user.module';

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
