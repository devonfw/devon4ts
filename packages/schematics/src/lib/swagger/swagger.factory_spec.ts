import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Swagger Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should work', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      path: '',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('swagger', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/package.json')).toBeDefined();
        expect(tree.readContent('/package.json')).toContain('@nestjs/swagger');
        expect(tree.readContent('/package.json')).toContain('swagger-ui-express');
        expect(tree.readContent('/src/main.ts')).toEqual(
          "import { NestFactory } from '@nestjs/core';\n" +
            "import { AppModule } from './app/app.module';\n" +
            "import { WinstonLogger } from './app/shared/logger/winston.logger';\n" +
            "import { ValidationPipe, VersioningType } from '@nestjs/common';\n" +
            "import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';\n" +
            '\n' +
            'async function bootstrap(): Promise<void> {\n' +
            '  const app = await NestFactory.create(AppModule, { bufferLogs: true });\n' +
            '\n' +
            '  const logger = app.get(WinstonLogger);\n' +
            '  app.useLogger(logger);\n' +
            '\n' +
            '  app.useGlobalPipes(\n' +
            '    new ValidationPipe({\n' +
            '      transform: true,\n' +
            '    }),\n' +
            '  );\n' +
            '  app.enableVersioning({\n' +
            '    type: VersioningType.URI,\n' +
            "    defaultVersion: '1',\n" +
            '  });\n' +
            "  if (process.env.NODE_ENV === 'develop') {\n" +
            '    const options = new DocumentBuilder()\n' +
            "      .setTitle('NestJS application')\n" +
            "      .setDescription('')\n" +
            "      .setVersion('0.0.1')\n" +
            '      .addBearerAuth()\n' +
            '      .build();\n' +
            '\n' +
            '    const swaggerDoc = SwaggerModule.createDocument(app, options);\n' +
            "    SwaggerModule.setup('v1/api', app, swaggerDoc);\n" +
            '  }\n' +
            '  await app.listen(3000);\n' +
            '}\n' +
            'bootstrap();\n',
        );
        expect(tree.readContent('/nest-cli.json')).toContain('@nestjs/swagger/plugin');
      });
    });
  });
  it('should set path', () => {
    const app: Record<string, any> = {
      name: 'app',
    };
    const options: Record<string, any> = {
      path: 'app',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('swagger', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/app/package.json')).toBeDefined();
        expect(tree.readContent('/app/package.json')).toContain('@nestjs/swagger');
        expect(tree.readContent('/app/package.json')).toContain('swagger-ui-express');
        expect(tree.readContent('/app/src/main.ts')).toEqual(
          "import { NestFactory } from '@nestjs/core';\n" +
            "import { AppModule } from './app/app.module';\n" +
            "import { WinstonLogger } from './app/shared/logger/winston.logger';\n" +
            "import { ValidationPipe, VersioningType } from '@nestjs/common';\n" +
            "import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';\n" +
            '\n' +
            'async function bootstrap(): Promise<void> {\n' +
            '  const app = await NestFactory.create(AppModule, { bufferLogs: true });\n\n' +
            '  const logger = app.get(WinstonLogger);\n' +
            '  app.useLogger(logger);\n\n' +
            '  app.useGlobalPipes(\n' +
            '    new ValidationPipe({\n' +
            '      transform: true,\n' +
            '    }),\n' +
            '  );\n' +
            '  app.enableVersioning({\n' +
            '    type: VersioningType.URI,\n' +
            "    defaultVersion: '1',\n" +
            '  });\n' +
            "  if (process.env.NODE_ENV === 'develop') {\n" +
            '    const options = new DocumentBuilder()\n' +
            "      .setTitle('NestJS application')\n" +
            "      .setDescription('')\n" +
            "      .setVersion('0.0.1')\n" +
            '      .addBearerAuth()\n' +
            '      .build();\n' +
            '\n' +
            '    const swaggerDoc = SwaggerModule.createDocument(app, options);\n' +
            "    SwaggerModule.setup('v1/api', app, swaggerDoc);\n" +
            '  }\n' +
            '  await app.listen(3000);\n' +
            '}\n' +
            'bootstrap();\n',
        );
        expect(tree.readContent('/app/nest-cli.json')).toContain('@nestjs/swagger/plugin');
      });
    });
  });
});
