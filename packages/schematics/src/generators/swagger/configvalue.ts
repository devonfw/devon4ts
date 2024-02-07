export const swaggerTemplateWithConfig = `if (config.isDev) {
    const options = new DocumentBuilder()
      .setTitle(config.swagger?.title ?? 'NestJS application')
      .setDescription(config.swagger?.description ?? '')
      .setVersion(config.swagger?.version ?? '0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v' + (config.defaultVersion) + '/api', app, swaggerDoc);
  }`;

export const swaggerTemplate = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v1/api', app, swaggerDoc);
  }`;

export const defaultSwaggerConfig = `{
    title: {
      doc: 'Swagger documentation title',
      default: 'NestJS Application',
      format: String,
    },
    description: {
      doc: 'Swagger documentation description',
      default: 'API Documentation',
      format: String,
    },
    version: {
      doc: 'Swagger documentation version',
      default: '0.0.1',
      format: String,
    },
  },`;

export const defaultSwaggerConfigType = `{
    title: string;
    description: string;
    version: string;
  }`;
