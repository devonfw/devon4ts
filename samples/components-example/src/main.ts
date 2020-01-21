import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalGuard } from './app/shared/guards/global.guard';
import { GlobalMiddlewareMiddleware } from './app/shared/middlewares/global-middleware.middleware';
import { GlobalPipe } from './app/shared/pipes/global.pipe';
import { GlobalInterceptor } from './app/shared/interceptors/global.interceptor';
import { GlobalFilter } from './app/shared/filters/global.filter';

async function bootstrap() {
  Logger.overrideLogger(['debug', 'error', 'log', 'verbose', 'warn']);
  const app = await NestFactory.create(AppModule);
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
