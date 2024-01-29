"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailerService = void 0;
const common_1 = require("@nestjs/common");
const mailer_constants_1 = require("./mailer.constants");
const fs = require("fs-extra");
const path_1 = require("path");
let MailerService = class MailerService {
    constructor(transporter, options) {
        this.transporter = transporter;
        this.options = options;
        this.hbsOptions = {
            templatesDir: (0, path_1.join)(__dirname, '../../../../templates/views'),
            extension: '.handlebars',
        };
        this.templates = {};
    }
    async onModuleInit() {
        if (this.options.hbsOptions) {
            const hbs = await Promise.resolve().then(() => require('handlebars'));
            this.hbs = hbs.create();
            Object.assign(this.hbsOptions, this.options.hbsOptions);
            if (this.hbsOptions.extension[0] !== '.') {
                this.hbsOptions.extension = '.' + this.hbsOptions.extension;
            }
            this.addPartials();
            this.addHelpers();
            this.addTemplates();
        }
    }
    onModuleDestroy() {
        this.transporter.close();
    }
    async sendPlainMail(firstParam, secondParam, thirdParam) {
        const mailOptions = {
            from: this.options.emailFrom,
        };
        if (typeof firstParam === 'string') {
            Object.assign(mailOptions, {
                from: this.options.emailFrom,
                to: firstParam,
                subject: secondParam,
                html: thirdParam,
            });
        }
        else {
            Object.assign(mailOptions, firstParam);
        }
        return await this.transporter.sendMail(mailOptions);
    }
    sendTemplateMail(firstParam, secondParam, thirdParam, fourthParam, fifthParam) {
        const mailOptions = {
            from: this.options.emailFrom,
        };
        if (typeof firstParam === 'string') {
            Object.assign(mailOptions, {
                from: this.options.emailFrom,
                to: firstParam,
                subject: secondParam,
            });
        }
        else {
            Object.assign(mailOptions, firstParam);
        }
        if (thirdParam && typeof firstParam === 'string') {
            mailOptions.html = this.templates[thirdParam](fourthParam, fifthParam);
        }
        else {
            mailOptions.html = this.templates[secondParam](thirdParam, fourthParam);
        }
        return this.transporter.sendMail(mailOptions);
    }
    addTemplate(name, template, options) {
        this.templates[name] = this.hbs.compile(template, options);
    }
    registerPartial(name, partial) {
        this.hbs.registerPartial(name, partial);
    }
    registerHelper(name, helper) {
        this.hbs.registerHelper(name, helper);
    }
    addHelpers() {
        if (this.hbsOptions.helpers && this.hbsOptions.helpers.length) {
            this.hbsOptions.helpers.forEach(helper => {
                this.hbs.registerHelper(helper.name, helper.func);
            });
        }
    }
    addTemplates() {
        if (fs.existsSync(this.hbsOptions.templatesDir)) {
            const templates = fs.readdirSync(this.hbsOptions.templatesDir, {
                withFileTypes: true,
            });
            templates
                .filter(value => value.name.endsWith(this.hbsOptions.extension) && value.isFile())
                .forEach(element => {
                this.templates[element.name.substring(0, element.name.indexOf('.'))] = this.hbs.compile(fs.readFileSync((0, path_1.join)(this.hbsOptions.templatesDir, element.name)).toString());
            });
        }
    }
    addPartials() {
        if (this.hbsOptions.partialsDir && fs.existsSync(this.hbsOptions.partialsDir)) {
            const partials = fs.readdirSync(this.hbsOptions.partialsDir, {
                withFileTypes: true,
            });
            partials
                .filter(value => value.name.endsWith(this.hbsOptions.extension) && value.isFile())
                .forEach(element => {
                this.hbs.registerPartial(element.name.substring(0, element.name.indexOf('.')), fs.readFileSync((0, path_1.join)(this.hbsOptions.partialsDir, element.name)).toString());
            });
        }
    }
};
MailerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(mailer_constants_1.MAILER_TRANSPORT_PROVIDER_NAME)),
    __param(1, (0, common_1.Inject)(mailer_constants_1.MAILER_OPTIONS_PROVIDER_NAME)),
    __metadata("design:paramtypes", [Object, Object])
], MailerService);
exports.MailerService = MailerService;
