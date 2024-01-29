"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerModule = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
const mailer_constants_1 = require("./mailer.constants");
const mailer_service_1 = require("./mailer.service");
let MailerModule = MailerModule_1 = class MailerModule {
    static register(options) {
        return {
            module: MailerModule_1,
            providers: [
                {
                    provide: mailer_constants_1.MAILER_OPTIONS_PROVIDER_NAME,
                    useValue: options || this.defaultOptions,
                },
                {
                    provide: mailer_constants_1.MAILER_TRANSPORT_PROVIDER_NAME,
                    useFactory: (opts) => {
                        return nodemailer.createTransport(opts.mailOptions);
                    },
                    inject: [mailer_constants_1.MAILER_OPTIONS_PROVIDER_NAME],
                },
            ],
            exports: [mailer_constants_1.MAILER_TRANSPORT_PROVIDER_NAME],
        };
    }
    static registerAsync(options) {
        const transportProvider = {
            provide: mailer_constants_1.MAILER_TRANSPORT_PROVIDER_NAME,
            useFactory: (mailerOptions) => {
                const opts = mailerOptions || this.defaultOptions;
                return nodemailer.createTransport(opts.mailOptions);
            },
            inject: [mailer_constants_1.MAILER_OPTIONS_PROVIDER_NAME],
        };
        const optionsProvider = {
            provide: mailer_constants_1.MAILER_OPTIONS_PROVIDER_NAME,
            useFactory: options.useFactory,
            inject: options.inject || [],
        };
        return {
            module: MailerModule_1,
            imports: options.imports,
            providers: [transportProvider, optionsProvider],
            exports: [transportProvider],
        };
    }
};
MailerModule.defaultOptions = {
    hbsOptions: {
        templatesDir: './templates/views',
    },
    mailOptions: { streamTransport: true, newline: 'windows' },
    emailFrom: 'noreply@capgemini.com',
};
MailerModule = MailerModule_1 = __decorate([
    (0, common_1.Module)({
        providers: [mailer_service_1.MailerService],
        exports: [mailer_service_1.MailerService],
    })
], MailerModule);
exports.MailerModule = MailerModule;
