import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Mailer Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage path', () => {
    const app: object = {
      name: 'foo',
    };
    const options: object = {
      path: 'foo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('mailer', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/foo/docker-compose.yml')).toBeDefined();
        expect(files.find(filename => filename === '/foo/templates/partials/layout.handlebars')).toBeDefined();
        expect(files.find(filename => filename === '/foo/templates/views/example.handlebars')).toBeDefined();
        expect(tree.readContent('/foo/src/app/core/core.module.ts')).toEqual(
          "import { Global, Module } from '@nestjs/common';\n" +
            "import { ClassSerializerInterceptor } from '@devon4node/common/serializer';\n" +
            "import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';\n" +
            "import { WinstonLogger } from '../shared/logger/winston.logger';\n" +
            "import { BusinessLogicFilter } from '../shared/filters/business-logic.filter';\n" +
            "import { MailerModule } from '@devon4node/mailer';\n" +
            '\n' +
            '@Global()\n' +
            '@Module({\n' +
            '  imports: [\n' +
            '    MailerModule.forRoot({\n' +
            '      mailOptions: {\n' +
            "        host: 'localhost',\n" +
            '        port: 1025,\n' +
            '        secure: false,\n' +
            '        tls: {\n' +
            '          rejectUnauthorized: false,\n' +
            '        },\n' +
            '      },\n' +
            "      emailFrom: 'noreply@example.com',\n" +
            '      hbsOptions: {\n' +
            "        templatesDir: join(__dirname, '../..', 'templates/views'),\n" +
            "        partialsDir: join(__dirname, '../..', 'templates/partials'),\n" +
            '        helpers: [],\n' +
            '      },\n' +
            '    }),\n' +
            '  ],\n' +
            '  controllers: [],\n' +
            '  providers: [\n' +
            '    { provide: APP_FILTER, useClass: BusinessLogicFilter },\n' +
            '    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },\n' +
            '    WinstonLogger,\n' +
            '  ],\n' +
            '  exports: [MailerModule, WinstonLogger],\n' +
            '})\n' +
            'export class CoreModule {}\n',
        );
      });
    });
  });
});
