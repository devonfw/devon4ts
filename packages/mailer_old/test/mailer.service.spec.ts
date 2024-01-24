import { Test, TestingModule } from '@nestjs/testing';
import { Transporter } from 'nodemailer';
import { join } from 'path';
import { MAILER_OPTIONS_PROVIDER_NAME, MAILER_TRANSPORT_PROVIDER_NAME } from '../lib/mailer.constants';
import { MailerService } from '../lib/mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let transporter: Pick<Transporter, 'sendMail'>;

  beforeEach(async () => {
    transporter = {
      sendMail: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: MAILER_TRANSPORT_PROVIDER_NAME,
          useValue: transporter,
        },
        {
          provide: MAILER_OPTIONS_PROVIDER_NAME,
          useValue: {
            emailFrom: 'someone@whatever.com',
            hbsOptions: {
              templatesDir: join(__dirname, './templates/views'),
              partialsDir: join(__dirname, './templates/partials'),
            },
            mailOptions: {},
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
    await service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created and register all templates, partials and helpers', () => {
    expect(service).toBeDefined();
  });

  it('should send a plain text email using the provided transporter providing an emailOptions object', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
      text: 'text',
    };

    const expected = { ...input, from: 'someone@whatever.com' };

    service.sendPlainMail(input);
    expect(transporter.sendMail).toBeCalledWith(expected);
  });

  it('should send a plain text email using the provided transporter providing all params', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
      html: 'text',
    };

    const expected = { ...input, from: 'someone@whatever.com' };

    service.sendPlainMail(input.to, input.subject, input.html);
    expect(transporter.sendMail).toBeCalledWith(expected);
  });

  it('should send email from a handlebars template by using the provided transporter providing emailOptions object', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
    };

    const expected = {
      ...input,
      from: 'someone@whatever.com',
      html: `<!DOCTYPE html>
<html lang=\"en\" xml:lang=\"en\">

<head>
  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">
  <meta name=\"viewport\" content=\"width=device-width\">
  <title>my title</title>
</head>

<body>
  <h1>Hello</h1>
  <p>This is a test</p>
</body>

</html>
`,
    };

    service.sendTemplateMail(input, 'test', { title: 'my title' });
    expect(transporter.sendMail).toBeCalledWith(expected);
  });

  it('should register a template and should be ready to use', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
    };

    const expected = {
      ...input,
      from: 'someone@whatever.com',
      html: `My view`,
    };

    service.addTemplate('my-view', `My view`);
    service.sendTemplateMail(input, 'my-view', {});
    expect(transporter.sendMail).toBeCalledWith(expected);
  });

  it('should register a partial and should be ready to use', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
    };

    const expected = {
      ...input,
      from: 'someone@whatever.com',
      html: `this is my partial: My view`,
    };

    service.addTemplate('my-view', `{{#> my-partial }}My view{{/my-partial}}`);
    service.registerPartial('my-partial', `this is my partial: {{> @partial-block }}`);
    service.sendTemplateMail(input, 'my-view', {});
    expect(transporter.sendMail).toBeCalledWith(expected);
  });

  it('should register a helper and should be ready to use', () => {
    const input = {
      to: 'to@to.com',
      subject: 'subject',
    };

    const expected = {
      ...input,
      from: 'someone@whatever.com',
      html: `<b>My view</b>`,
    };

    service.registerHelper('bold', function (options) {
      return '<b>' + options.fn(this) + '</b>';
    });
    service.addTemplate('my-view', `{{#bold}}My view{{/bold}}`);
    service.sendTemplateMail(input, 'my-view', {});
    expect(transporter.sendMail).toBeCalledWith(expected);
  });
});
