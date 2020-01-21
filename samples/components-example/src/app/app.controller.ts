import { Controller, Get, Query, UseGuards, UsePipes, UseInterceptors, UseFilters } from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerGuard } from './shared/guards/controller.guard';
import { HandlerGuard } from './shared/guards/handler.guard';
import { HandlerPipe } from './shared/pipes/handler.pipe';
import { ControllerInterceptor } from './shared/interceptors/controller.interceptor';
import { HandlerInterceptor } from './shared/interceptors/handler.interceptor';
import { TestFilter } from './shared/filters/test.filter';
import { TestException } from './shared/exceptions/test.exception';
import { ControllerFilter } from './shared/filters/controller.filter';
import { ControllerException } from './shared/exceptions/controller.exception';
import { GlobalException } from './shared/exceptions/global.exception';

@Controller()
@UseGuards(ControllerGuard)
@UseInterceptors(ControllerInterceptor)
@UseFilters(ControllerFilter)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(HandlerGuard)
  @UsePipes(HandlerPipe)
  @UseFilters(TestFilter)
  @UseInterceptors(HandlerInterceptor)
  getHello(@Query('hello') hello: string): string {
    if (hello) {
      if (hello === 'error') {
        throw new TestException();
      }
      if (hello === 'controller') {
        throw new ControllerException();
      }
      if (hello === 'global') {
        throw new GlobalException();
      }
      return hello;
    }
    return this.appService.getHello();
  }
}
