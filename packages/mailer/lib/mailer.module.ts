import { DynamicModule, Module, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as nodemailer from 'nodemailer';
import {
  MAILER_TRANSPORT_PROVIDER_NAME,
  MAILER_OPTIONS_PROVIDER_NAME,
} from './mailer.constants';
import { MailerService } from './mailer.service';
import { MailerModuleOptions, MailerModuleAsyncOptions } from './mailer.types';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule implements OnModuleDestroy {
  private static defaultOptions: MailerModuleOptions = {
    hbsOptions: {
      templatesDir: './templates/views',
    },
    mailOptions: { streamTransport: true, newline: 'windows' },
    emailFrom: 'noreply@capgemini.com',
  };

  constructor(private readonly moduleRef: ModuleRef) {}

  static forRoot(options?: MailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: MAILER_OPTIONS_PROVIDER_NAME,
          useValue: options || this.defaultOptions,
        },
        {
          provide: MAILER_TRANSPORT_PROVIDER_NAME,
          useFactory: (opts: MailerModuleOptions) => {
            return nodemailer.createTransport(opts.mailOptions);
          },
          inject: [MAILER_OPTIONS_PROVIDER_NAME],
        },
      ],
      exports: [MAILER_TRANSPORT_PROVIDER_NAME],
    };
  }

  static forRootAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const transportProvider = {
      provide: MAILER_TRANSPORT_PROVIDER_NAME,
      useFactory: (
        mailerOptions: MailerModuleOptions,
      ): nodemailer.Transporter => {
        const opts = mailerOptions || this.defaultOptions;
        return nodemailer.createTransport(opts.mailOptions);
      },
      inject: [MAILER_OPTIONS_PROVIDER_NAME],
    };

    const optionsProvider = {
      provide: MAILER_OPTIONS_PROVIDER_NAME,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: MailerModule,
      imports: options.imports,
      providers: [transportProvider, optionsProvider],
      exports: [transportProvider],
    };
  }

  onModuleDestroy() {
    const transport = this.moduleRef.get<nodemailer.Transporter>(
      MAILER_TRANSPORT_PROVIDER_NAME,
    );
    transport.close();
  }
}
