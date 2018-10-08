import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationService } from 'shared/configuration/configuration.service';
import { Configuration } from 'shared/configuration/configuration.enum';
import { SharedModule } from 'shared/shared.module';
import { TodoModule } from './todo/todo.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import * as winston from 'winston';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      synchronize: true,
      logging: false,
      entities: ['./**/*.entity{.ts,.js}'],
    }),
    SharedModule,
    TodoModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  static host: string | undefined;
  static port: string | number;
  static isDev: boolean;
  static appName: string | undefined;
  static appVersion: string | undefined;
  static appDescription: string | undefined;
  static appBasePath: string | undefined;
  static logger: winston.Logger;

  constructor(private readonly _configurationService: ConfigurationService) {
    const SOURCE_PATH = _configurationService.isDevelopment ? 'src' : 'dist';

    module.exports = {
      type: 'sqlite',
      database: 'database.db',
      synchronize: true,
      logging: false,
      entities: [`${SOURCE_PATH}/**/**/**.entity{.ts,.js}`],
    };

    AppModule.port = AppModule.normalizePort(
      _configurationService.get(Configuration.PORT),
    );
    AppModule.host = _configurationService.get(Configuration.HOST);
    AppModule.isDev = _configurationService.isDevelopment;
    AppModule.appName = _configurationService.swaggerTitle;
    AppModule.appVersion = _configurationService.swaggerVersion;
    AppModule.appDescription = _configurationService.swaggerDescription;
    AppModule.appBasePath = _configurationService.swaggerBasePath;
    AppModule.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD hh:mm:ss A ZZ',
        }),
        winston.format.json(),
      ),
      level: 'info',
      transports: [
        new winston.transports.File({
          filename: `${__dirname}/logs/error.log`,
          level: 'error',
        }),
        new winston.transports.File({
          filename: `${__dirname}/logs/general.log`,
        }),
      ],
    });
  }

  private static normalizePort(param: string | number): string | number {
    const portNumber: number =
      typeof param === 'string' ? parseInt(param, 10) : param;
    if (isNaN(portNumber)) return param;
    else if (portNumber >= 0) return portNumber;
  }
}
