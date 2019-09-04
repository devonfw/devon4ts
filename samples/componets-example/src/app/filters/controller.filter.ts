import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ControllerException } from '../exceptions/controller.exception';

@Catch(ControllerException)
export class ControllerFilter implements ExceptionFilter<ControllerException> {
  catch(exception: ControllerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('Im controller filter. Path: ' + request.url);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
