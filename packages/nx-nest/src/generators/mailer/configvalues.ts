export const defaultMailerValues = `{
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
}`;

export const mailerValuesFromConfig = `{
  mailOptions: {
    host: config.mailer.mailOptions.host,
    port: config.mailer.mailOptions.port,
    secure: config.mailer.mailOptions.secure,
    tls: {
      rejectUnauthorized: config.mailer.mailOptions.tlsRejectUnauthorized,
    },
  },
  emailFrom: config.mailer.emailFrom,
  hbsOptions: {
    templatesDir: join(__dirname, '../..', config.mailer.hbsOptions.templatesDir),
    partialsDir: join(__dirname, '../..', config.mailer.hbsOptions.partialsDir),
    helpers: [],
  },
}`;

export const mailerConfigType = `{
    mailOptions: {
      host: string;
      port: number;
      secure: boolean;
      tlsRejectUnauthorized: boolean;
    };
    emailFrom: string;
    hbsOptions: {
      templatesDir: string;
      partialsDir: string;
    };
  }`;

export const mailerConfigFile = `{
  mailOptions: {
    host: {
      doc: 'Mail server host URL',
      default: 'localhost',
      format: String,
      env: 'MAILER_HOST',
    },
    port: {
      doc: 'Mail server port',
      default: 1025,
      format: 'port',
      env: 'MAILER_PORT',
    },
    secure: {
      doc: 'Is the mailer server secured?',
      default: false,
      format: Boolean,
      env: 'MAILER_SECURE',
    },
    tlsRejectUnauthorized: {
      doc: 'Reject unauthorized TLS connections?',
      default: false,
      format: Boolean,
      env: 'MAILER_TLS_REJECT_UNAUTHORIZED',
    },
  },
  emailFrom: {
    doc: 'Email that will be used as sender',
    default: 'noreply@example.com',
    format: String,
    env: 'MAILER_EMAIL_FROM',
    arg: 'emailFrom',
  },
  hbsOptions: {
    templatesDir: {
      doc: 'Relative path to handlebars views folder',
      default: 'assets/templates/views',
      format: String,
    },
    partialsDir: {
      doc: 'Relative path to handlebars partials folder',
      default: 'assets/templates/partials',
      format: String,
    },
  },
}`;
