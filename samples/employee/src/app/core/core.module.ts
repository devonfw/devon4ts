import { Global, Module } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@devon4node/common/serializer';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonLogger } from '../shared/logger/winston.logger';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationService } from './configuration/services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Global()
@Module({
  imports: [
    UserModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (config: ConfigurationService) => {
        return config.database;
      },
      inject: [ConfigurationService],
    }),
    ConfigurationModule,
  ],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, WinstonLogger],
  exports: [UserModule, AuthModule, ConfigurationModule, WinstonLogger],
})
export class CoreModule {}
