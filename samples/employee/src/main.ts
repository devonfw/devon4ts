import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { WinstonLogger } from './app/shared/logger/winston.logger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigurationModule } from './app/core/configuration/configuration.module';
import { ConfigurationService } from './app/core/configuration/services';
import * as helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  Logger.overrideLogger(['debug', 'error', 'log', 'verbose', 'warn']);
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });
  const configModule = app.select(ConfigurationModule).get(ConfigurationService);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.use(helmet());
  app.enableCors({
    origin: '*',
    credentials: true,
    exposedHeaders: 'Authorization',
    allowedHeaders: 'authorization, content-type',
  });
  if (configModule.isDev) {
    const options = new DocumentBuilder()
      .setTitle(configModule.swaggerConfig.swaggerTitle)
      .setDescription(configModule.swaggerConfig.swaggerDescription)
      .setVersion(configModule.swaggerConfig.swaggerVersion)
      .setHost(configModule.host + ':' + configModule.port)
      .setBasePath(configModule.swaggerConfig.swaggerBasepath)
      .addBearerAuth('Authorization', 'header')
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup((configModule.globalPrefix || '') + '/api', app, swaggerDoc);
  }
  app.setGlobalPrefix(configModule.globalPrefix);
  await app.listen(configModule.port);
}
bootstrap();
