import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TestException } from '../exceptions/test.exception';
import { Request, Response } from 'express';

@Catch(TestException)
export class TestFilter implements ExceptionFilter<TestException> {
  catch(exception: TestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('Im handler filter. Path: ' + request.url);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
