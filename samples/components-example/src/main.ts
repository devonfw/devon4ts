import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { GlobalGuard } from './app/guards/global.guard';
import { GlobalMiddlewareMiddleware } from './app/middleware/global-middleware.middleware';
import { GlobalPipe } from './app/pipes/global.pipe';
import { GlobalInterceptor } from './app/interceptors/global.interceptor';
import { GlobalFilter } from './app/filters/global.filter';

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
