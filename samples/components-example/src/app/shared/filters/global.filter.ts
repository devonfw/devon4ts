import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TestException } from '../exceptions/test.exception';
import { Request, Response } from 'express';
import { GlobalException } from '../exceptions/global.exception';

@Catch(TestException, GlobalException)
export class GlobalFilter implements ExceptionFilter<TestException | GlobalException> {
  catch(exception: TestException | GlobalException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('Im global filter. Path: ' + request.url);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
