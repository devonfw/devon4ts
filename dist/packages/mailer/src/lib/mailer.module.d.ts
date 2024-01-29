import { DynamicModule } from '@nestjs/common';
import { MailerModuleAsyncOptions, MailerModuleOptions } from './mailer.types';
export declare class MailerModule {
    private static defaultOptions;
    static register(options?: MailerModuleOptions): DynamicModule;
    static registerAsync(options: MailerModuleAsyncOptions): DynamicModule;
}
