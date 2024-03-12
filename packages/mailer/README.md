# devon4ts

[devonfw](https://www.devonfw.com/) is a platform which provides solutions to building business applications which combine best-in-class frameworks and libraries as well as industry proven practices and code conventions. devonfw is 100% Open Source (Apache License version 2.0) since the beginning of 2018.

devon4ts is the NodeJS stack of devonfw. It allows you to build business applications (backends) using NodeJS technology in a standardized way based on established best-practices.

![License](https://img.shields.io/npm/l/@devon4ts/mailer)
![License](https://img.shields.io/npm/v/@devon4ts/mailer)
![License](https://img.shields.io/librariesio/release/npm/@devon4ts/mailer)
![License](https://img.shields.io/npm/dt/@devon4ts/mailer)

## devon4ts mailer

This package contains the devon4ts mailer module. This module allows you to send emails in your devon4ts application in a easy way.

## Usage

### Installation

To start using `@devon4ts/mailer` you just need to import the `MailerModule`:

```typescript
@Module({
  imports: [
    MailerModule.register({
      mailOptions: {
        host: 'localhost',
        port: 1025,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      },
      emailFrom: 'noreply@example.com',
      hbsOptions: {
        templatesDir: join(__dirname, '../..', 'assets/templates/views'),
        partialsDir: join(__dirname, '../..', 'assets/templates/partials'),
        helpers: [],
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

You can also use the asynchronous configuration:

```typescript
@Module({
  imports: [
    MailerModule.registerAsync({
      useFactory: (config: AppConfig) => config.mailer,
      inject: [AppConfig],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### Usage

Frist, inject the MailerService:

```typescript
@Injectable()
export class AppService {
  constructor(mailer: MailerService) {}
}
```

And then use the `MailerService` methods:

Send a plain email:

```typescript
mailer.sendPlainMail(to, subject, mailContent);
```

Send a mail based on a template:

```typescript
mailer.sendTemplateMail(to, subject, templateName, emailData, hbsOptions);
```

Add an handlebars template:

```typescript
mailer.addTemplate(name, template, options);
```

Register an handlebars partial:

```typescript
mailer.registerPartial(name, partial);
```

Register an handlebars helper:

```typescript
mailer.registerHelper(name, helper);
```

## Code of conduct

Visit [code of conduct document](https://github.com/devonfw/.github/blob/master/CODE_OF_CONDUCT.md).

## Contributing guide

Visit [contributing guide document](https://github.com/devonfw/.github/blob/master/CONTRIBUTING.asciidoc).

## Key Principles

Visit [key principles document](https://github.com/devonfw/.github/blob/master/key-principles.asciidoc).
