/* istanbul ignore file */
import { Inject, Injectable, LoggerService, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import * as winston from 'winston';
import { separator, colorize, pid, oneLineStack } from '@devon4node/logform';

const BASE_LOGGER: winston.Logger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), pid(), oneLineStack(false), colorize(true), separator()),
  level: 'info',
  transports: new winston.transports.Console(),
});

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(@Inject(INQUIRER) private parent: object | string) {
    this.logger = BASE_LOGGER.child({});
    const context = typeof parent === 'string' ? parent : this.parent?.constructor?.name ?? 'main';
    this.logger.defaultMeta = { context };
  }

  log(message: string, context?: string, ...extras: string[]): void {
    this.logger.info(message, { context, extras });
  }

  error(message: string, context?: string, ...extras: string[]): void;
  error(error: Error, context?: string, ...extras: string[]): void;
  error(messageOrError: any, context?: string, ...extras: string[]): void {
    const meta: Record<string, string | string[] | undefined> = { context, extras };
    let message = messageOrError;

    if (messageOrError instanceof Error) {
      meta.stack = messageOrError.stack;
      message = messageOrError.message;
    }

    this.logger.error(message, meta);
  }

  warn(message: string, context?: string, ...extras: string[]): void {
    this.logger.warn(message, { context, extras });
  }

  debug(message: string, context?: string, ...extras: string[]): void {
    this.logger.debug(message, { context, extras });
  }

  verbose(message: any, context?: string, ...extras: any[]): void {
    this.logger.verbose(message, { context, extras });
  }
}
