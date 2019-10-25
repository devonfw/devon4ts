# devon4node mailer module

This module enables you to send emails in devon4node. It also provides a template engine using Handlebars.

It is a NestJS module that inject into your application a MailerService, which is the responsible to send the emails using the nodemailer library.

## Installing

Execute the following command in a devon4node project:

```shell
yarn add @devon4node/mailer
```

## Configuring

To configure the mailer module, you only need to import it in your application into another module. Example:

```typescript
@Module({
  ...
  imports: [
    MailerModule.forRoot(),
  ],
  ...
})
```

Your must pass the configuration using the forRoot or forRootAsync methods.

### forRoot()

The forRoot method recives an MailerModuleOptions object as parameter. It configures the MailerModule using the input MailerModuleOptions object.

The structure of MailerModuleOptions is:

```typescript
{
  hbsOptions?: {
    templatesDir: string;
    extension?: string;
    partialsDir?: string;
    helpers?: IHelperFunction[];
    compilerOptions?: ICompileOptions;
  },
  mailOptions?: nodemailerSmtpTransportOptions;
  emailFrom: string;
}
```

Here, you need to specify the [Handlebars compile options](https://handlebarsjs.com/reference.html), the [nodemailer transport options](https://nodemailer.com/smtp) and the email address which will send the emails.
Then, you need to call to forRoot function in the module imports. Example:

```typescript
@Module({
  ...
  imports: [
    MailerModule.forRoot({
      mailOptions: {
        host: 'localhost',
        port: 1025,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      emailFrom: 'noreply@capgemini.com',
      hbsOptions: {
        templatesDir: join(__dirname, '../..', 'templates/views'),
        partialsDir: join(__dirname, '../..', 'templates/partials'),
        helpers: [{
          name: 'fullname',
          func: person => `${person.name} ${person.surname}`,s
        }],
      },
    }),
  ...
})
```

### forRootAsync()

The method forRootAsync enables you to get the mailer configuration in a asynchronous way. It is usefull when you need to get the configuration using, for example, a service (e.g. ConfigurationService).

Example:

```typescript
@Module({
  ...
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigurationModule],
      useFactory: (config: ConfigurationService) => {
        return config.mailerConfig;
      },
      inject: [ConfigurationService],
    }),
  ...
})
```

In this example, we use the ConfigurationService in order to get the MailerModuleOptions (the same as forRoot)

## Usage

In order to use, you only need to inject using the dependency injection the MailerService.

Example:

```typescript
@Injectable()
export class CatsService {
  constructor(private readonly mailer: MailerService) {}
}
```

Then, you only need to use the methods provided by the MailerService in your service. Take into account that you can inject it in every place that support NestJS dependency injection.

### MailerService methods

#### sendPlainMail

The method sendPlainMail recive a string sends a email.

The method signatures are:

```typescript
sendPlainMail(emailOptions: SendMailOptions): Promise<SentMessageInfo>;
sendPlainMail(to: string, subject: string, mail: string): Promise<SentMessageInfo>;
```

Examples:

```typescript
this.mailer.sendPlainMail({
  to: 'example@example.com',
  subject: 'This is a subject',
  html: '<h1>Hello world</h1>'
});
this.mailer.sendPlainMail('example@example.com', 'This is a subject', '<h1>Hello world</h1>');
```

#### sendTemplateMail

The method sendTemplateMail sends a email based on a Handlebars template. The templates are registered using the templatesDir option or using the addTemplate method.
The template name is the name of the template (without extension) or the first parameter of the method addTemplate.

The method signatures are:

```typescript
sendTemplateMail(emailOptions: SendMailOptions, templateName: string, emailData: any, hbsOptions?: RuntimeOptions): Promise<SentMessageInfo>;
sendTemplateMail(to: string, subject: string, templateName: string, emailData: any, hbsOptions?: RuntimeOptions): Promise<SentMessageInfo>;
```

Examples:

```typescript
this.mailer.sendTemplateMail({
  to: 'example@example.com',
  subject: 'This is a subject',
  html: '<h1>Hello world</h1>'
}, 'template1', { person: {name: 'Dario', surname: 'Rodriguez'}});
this.mailer.sendTemplateMail('example@example.com', 'This is a subject', 'template1', { person: {name: 'Dario', surname: 'Rodriguez'}});
```

#### addTemplate

Adds a new template to the MailerService.

Mehotd signature:

```typescript
addTemplate(name: string, template: string, options?: CompileOptions): void;
```

Example:

```typescript
this.mailer.addTemplate('newTemplate', '<html><head></head><body>{{>partial1}}</body></html>')
```

#### registerPartial

Register a new partial in Handlebars.

Mehotd signature:

```typescript
registerPartial(name: string, partial: Handlebars.Template<any>): void;
```

Example:

```typescript
this.mailer.registerPartial('partial', '<h1>Hello World</h1>')
```

#### registerHelper

Register a new helper in Handlebars.

Mehotd signature:

```typescript
registerHelper(name: string, helper: Handlebars.HelperDelegate): void;
```

Example:

```typescript
this.mailer.registerHelper('fullname', person => `${person.name} ${person.surname}`)
```

## Handlebars templates

As mentioned above, this module allow you to use Handlebars as template engine, but it is optional. If you do not need the Handlebars, you just need to keep the hbsOptions undefined.

In order to get the templates form the file system, you can specify the template folder, the partials folder and the helpers.
At the moment of module initialization, it will read the content of the template folder, and will register every file with the name (without extension) and the content as Handlebars template. It will do the same for the partials.

You can specify the extension of template files using the `extension` parameter. The default value is `.handlebars`

## Local development

If you want to work with this module but you dont have a SMTP server, you can use the `streamTransport`. Example:

```typescript
{
  mailOptions: {
    streamTransport: true,
    newline: 'windows',
  },
  emailFrom: ...
  hbsOptions: ...
}
```

Then, you need to get the sendPlainMail or sendTemplateMail result, and print the email to the extandart output (STDOUT). Example:

```typescript
const mail = await this.mailer.sendTemplateMail(...);

mail.message.pipe(process.stdout);
```
