import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { AppService } from './app.service';
import { ControllerGuard } from './guards/controller.guard';
import { HandlerGuard } from './guards/handler.guard';
import { HandlerPipe } from './pipes/handler.pipe';
import { ControllerInterceptor } from './interceptors/controller.interceptor';
import { HandlerInterceptor } from './interceptors/handler.interceptor';
import { TestFilter } from './filters/test.filter';
import { TestException } from './exceptions/test.exception';
import { ControllerFilter } from './filters/controller.filter';
import { ControllerException } from './exceptions/controller.exception';
import { GlobalException } from './exceptions/global.exception';

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
