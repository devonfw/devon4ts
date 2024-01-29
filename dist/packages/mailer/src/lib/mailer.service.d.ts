import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Transporter, SentMessageInfo, SendMailOptions } from 'nodemailer';
import { MailerModuleOptions } from './mailer.types';
export declare class MailerService implements OnModuleInit, OnModuleDestroy {
    readonly transporter: Transporter;
    private readonly options;
    private hbsOptions;
    private hbs;
    private readonly templates;
    constructor(transporter: Transporter, options: MailerModuleOptions);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    sendPlainMail(emailOptions: SendMailOptions): Promise<SentMessageInfo>;
    sendPlainMail(to: string, subject: string, mail: string): Promise<SentMessageInfo>;
    sendTemplateMail(emailOptions: SendMailOptions, templateName: string, emailData: any, hbsOptions?: RuntimeOptions): Promise<SentMessageInfo>;
    sendTemplateMail(to: string, subject: string, templateName: string, emailData: any, hbsOptions?: RuntimeOptions): Promise<SentMessageInfo>;
    addTemplate(name: string, template: string, options?: CompileOptions): void;
    registerPartial(name: string, partial: Handlebars.Template<any>): void;
    registerHelper(name: string, helper: Handlebars.HelperDelegate): void;
    private addHelpers;
    private addTemplates;
    private addPartials;
}
