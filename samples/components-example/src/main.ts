import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalFilter } from './app/shared/filters/global.filter';
import { GlobalGuard } from './app/shared/guards/global.guard';
import { GlobalInterceptor } from './app/shared/interceptors/global.interceptor';
import { WinstonLogger } from './app/shared/logger/winston.logger';
import { GlobalMiddlewareMiddleware } from './app/shared/middlewares/global-middleware.middleware';
import { GlobalPipe } from './app/shared/pipes/global.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: new WinstonLogger() });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalPipes(new GlobalPipe());
  app.useGlobalGuards(new GlobalGuard());
  app.useGlobalFilters(new GlobalFilter());
  app.use(new GlobalMiddlewareMiddleware().use);
  app.useGlobalInterceptors(new GlobalInterceptor());
  app.setGlobalPrefix('v1');
  await app.listen(3000);
}
bootstrap();
