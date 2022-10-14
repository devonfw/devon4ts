import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Transporter, SentMessageInfo, SendMailOptions } from 'nodemailer';
import { MAILER_OPTIONS_PROVIDER_NAME, MAILER_TRANSPORT_PROVIDER_NAME } from './mailer.constants';
import { MailerModuleOptions, IHandlebarsOptions } from './mailer.types';
import * as fs from 'fs-extra';
import { join } from 'path';

@Injectable()
export class MailerService implements OnModuleInit, OnModuleDestroy {
  private hbsOptions: IHandlebarsOptions = {
    templatesDir: join(__dirname, '../../../../templates/views'),
    extension: '.handlebars',
  };
  private hbs: any;
  private readonly templates: {
    [T: string]: Handlebars.TemplateDelegate<any>;
  } = {};

  constructor(
    @Inject(MAILER_TRANSPORT_PROVIDER_NAME)
    readonly transporter: Transporter,
    @Inject(MAILER_OPTIONS_PROVIDER_NAME)
    private readonly options: MailerModuleOptions,
  ) {}

  async onModuleInit(): Promise<void> {
    if (this.options.hbsOptions) {
      const hbs = await import('handlebars');

      this.hbs = hbs.create();

      Object.assign(this.hbsOptions, this.options.hbsOptions);

      if (this.hbsOptions.extension![0] !== '.') {
        this.hbsOptions.extension = '.' + this.hbsOptions.extension;
      }

      this.addPartials();

      this.addHelpers();

      this.addTemplates();
    }
  }

  onModuleDestroy(): void {
    this.transporter.close();
  }

  async sendPlainMail(emailOptions: SendMailOptions): Promise<SentMessageInfo>;
  async sendPlainMail(to: string, subject: string, mail: string): Promise<SentMessageInfo>;
  async sendPlainMail(
    firstParam: string | SendMailOptions,
    secondParam?: string,
    thirdParam?: string,
  ): Promise<SentMessageInfo> {
    const mailOptions: SendMailOptions = {
      from: this.options.emailFrom,
    };

    if (typeof firstParam === 'string') {
      Object.assign(mailOptions, {
        from: this.options.emailFrom,
        to: firstParam,
        subject: secondParam,
        html: thirdParam,
      });
    } else {
      Object.assign(mailOptions, firstParam);
    }

    return await this.transporter.sendMail(mailOptions);
  }

  async sendTemplateMail(
    emailOptions: SendMailOptions,
    templateName: string,
    emailData: any,
    hbsOptions?: RuntimeOptions,
  ): Promise<SentMessageInfo>;
  async sendTemplateMail(
    to: string,
    subject: string,
    templateName: string,
    emailData: any,
    hbsOptions?: RuntimeOptions,
  ): Promise<SentMessageInfo>;
  sendTemplateMail(
    firstParam: string | SendMailOptions,
    secondParam?: string,
    thirdParam?: string,
    fourthParam?: any,
    fifthParam?: RuntimeOptions,
  ): Promise<SentMessageInfo> {
    const mailOptions: SendMailOptions = {
      from: this.options.emailFrom,
    };

    if (typeof firstParam === 'string') {
      Object.assign(mailOptions, {
        from: this.options.emailFrom,
        to: firstParam,
        subject: secondParam,
      });
    } else {
      Object.assign(mailOptions, firstParam);
    }

    if (thirdParam && typeof firstParam === 'string') {
      mailOptions.html = this.templates[thirdParam!](fourthParam, fifthParam);
    } else {
      mailOptions.html = this.templates[secondParam!](thirdParam, fourthParam);
    }

    return this.transporter.sendMail(mailOptions);
  }

  addTemplate(name: string, template: string, options?: CompileOptions): void {
    this.templates[name] = this.hbs.compile(template, options);
  }

  registerPartial(name: string, partial: Handlebars.Template<any>): void {
    this.hbs.registerPartial(name, partial);
  }

  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.hbs.registerHelper(name, helper);
  }

  private addHelpers(): void {
    if (this.hbsOptions.helpers && this.hbsOptions.helpers.length) {
      this.hbsOptions.helpers.forEach(helper => {
        this.hbs.registerHelper(helper.name, helper.func);
      });
    }
  }

  private addTemplates(): void {
    if (fs.existsSync(this.hbsOptions.templatesDir)) {
      const templates = fs.readdirSync(this.hbsOptions!.templatesDir, {
        withFileTypes: true,
      });
      templates
        .filter(value => value.name.endsWith(this.hbsOptions!.extension!) && value.isFile())
        .forEach(element => {
          this.templates[element.name.substring(0, element.name.indexOf('.'))] = this.hbs.compile(
            fs.readFileSync(join(this.hbsOptions.templatesDir, element.name)).toString(),
          );
        });
    }
  }

  private addPartials(): void {
    if (this.hbsOptions.partialsDir && fs.existsSync(this.hbsOptions.partialsDir)) {
      const partials = fs.readdirSync(this.hbsOptions!.partialsDir, {
        withFileTypes: true,
      });
      partials
        .filter(value => value.name.endsWith(this.hbsOptions!.extension!) && value.isFile())
        .forEach(element => {
          this.hbs.registerPartial(
            element.name.substring(0, element.name.indexOf('.')),
            fs.readFileSync(join(this.hbsOptions.partialsDir!, element.name)).toString(),
          );
        });
    }
  }
}
