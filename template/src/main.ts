import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigurationModule } from './shared/configuration/configuration.module';
import { ConfigurationService } from './shared/configuration/configuration.service';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { WistonLogger } from './shared/logger/wiston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WistonLogger(),
  });
  const config = app.select(ConfigurationModule).get(ConfigurationService);
  const hostDomain = `${config.host}:${config.port}`;

  if (config.isDev) {
    const swaggerOptions = new DocumentBuilder()
      .setTitle(config.swaggerConfig.title)
      .setDescription(config.swaggerConfig.description)
      .setVersion(config.swaggerConfig.version)
      .setHost(hostDomain.split('//')[1])
      .setSchemes('http')
      .setBasePath(config.swaggerConfig.basepath)
      .addBearerAuth('Authorization', 'header')
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, swaggerOptions);

    app.use(
      `${config.swaggerConfig.basepath}/docs/swagger.json`,
      (_req: any, res: any) => {
        res.send(swaggerDoc);
      },
    );

    SwaggerModule.setup('/api/docs', app, swaggerDoc, {
      swaggerUrl: `${hostDomain}${
        config.swaggerConfig.basepath
      }/docs/swagger.json`,
      explorer: true,
      swaggerOptions: {
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
    });
  }

  app.setGlobalPrefix(config.swaggerConfig.basepath);
  app.useGlobalFilters(new HttpExceptionFilter());
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
  await app.listen(config.port);
}
bootstrap();
