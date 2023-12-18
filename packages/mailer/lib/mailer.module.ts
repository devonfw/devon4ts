import { DynamicModule, Module } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MAILER_OPTIONS_PROVIDER_NAME, MAILER_TRANSPORT_PROVIDER_NAME } from './mailer.constants';
import { MailerService } from './mailer.service';
import { MailerModuleAsyncOptions, MailerModuleOptions } from './mailer.types';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {
  private static defaultOptions: MailerModuleOptions = {
    hbsOptions: {
      templatesDir: './templates/views',
    },
    mailOptions: { streamTransport: true, newline: 'windows' },
    emailFrom: 'noreply@capgemini.com',
  };

  static register(options?: MailerModuleOptions): DynamicModule {
    return {
      module: MailerModule,
      providers: [
        {
          provide: MAILER_OPTIONS_PROVIDER_NAME,
          useValue: options || this.defaultOptions,
        },
        {
          provide: MAILER_TRANSPORT_PROVIDER_NAME,
          useFactory: (opts: MailerModuleOptions): any => {
            return nodemailer.createTransport(opts.mailOptions);
          },
          inject: [MAILER_OPTIONS_PROVIDER_NAME],
        },
      ],
      exports: [MAILER_TRANSPORT_PROVIDER_NAME],
    };
  }

  static registerAsync(options: MailerModuleAsyncOptions): DynamicModule {
    const transportProvider = {
      provide: MAILER_TRANSPORT_PROVIDER_NAME,
      useFactory: (mailerOptions: MailerModuleOptions): nodemailer.Transporter => {
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
}
