import { ArgumentsHost, Catch, ExceptionFilter, Optional } from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFound } from '../exceptions/entity-not-found.exception';
import { WinstonLogger } from '../logger/winston.logger';

@Catch(EntityNotFound)
export class EntityNotFoundFilter implements ExceptionFilter {
  constructor(@Optional() public readonly logger?: WinstonLogger) {}

  catch(exception: EntityNotFound<any>, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (this.logger) {
      this.logger.error(exception.message, exception.stack!, 'LogicFilter');
    }

    response.status(404).send();
  }
}
