import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Config-module', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage path', async () => {
    const optionsApp: object = {
      name: 'foo',
    };
    const optionsModule: object = {
      path: 'foo',
    };
    let app;
    app = await runner.runSchematicAsync('application', optionsApp);
    app.subscribe(tree => {
      app = runner.runSchematicAsync('config-module', optionsModule, tree);
      app.subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/foo/src/main.ts')).toBeDefined();
        expect(tree.readContent('/foo/src/main.ts')).toEqual(
          "import { NestFactory } from '@nestjs/core';\n" +
            "import { AppModule } from './app/app.module';\n" +
            "import { WinstonLogger } from './app/shared/logger/winston.logger';\n" +
            "import { ValidationPipe } from '@nestjs/common';\n" +
            "import { ConfigService } from '@devon4node/config';\n" +
            '\n' +
            'async function bootstrap(): Promise<void> {\n' +
            '  const app = await NestFactory.create(AppModule, { logger: new WinstonLogger() });\n' +
            '  const configModule = app.get(ConfigService);\n' +
            '  app.useGlobalPipes(\n' +
            '    new ValidationPipe({\n' +
            '      transform: true,\n' +
            '    }),\n' +
            '  );\n' +
            '  app.setGlobalPrefix(configModule.values.globalPrefix);\n' +
            '  await app.listen(configModule.values.port);\n' +
            '}\n' +
            'bootstrap();\n',
        );
      });
    });
  });
  it('should manage declaration in core module', async () => {
    const optionsApp: object = {
      name: '',
    };
    const optionsModule: object = {
      path: '',
    };
    let app;
    app = await runner.runSchematicAsync('application', optionsApp);
    app.subscribe(tree => {
      app = runner.runSchematicAsync('config-module', optionsModule, tree);
      app.subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/src/app/core/core.module.ts')).toBeDefined();
        expect(tree.readContent('/src/app/core/core.module.ts')).toEqual(
          "import { Global, Module } from '@nestjs/common';\n" +
            "import { ClassSerializerInterceptor } from '@devon4node/common/serializer';\n" +
            "import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';\n" +
            "import { WinstonLogger } from '../shared/logger/winston.logger';\n" +
            "import { BusinessLogicFilter } from '../shared/filters/business-logic.filter';\n" +
            "import { ConfigModule } from '@devon4node/config';\n" +
            "import { Config } from '../shared/model/config/config.model';\n" +
            '\n' +
            '@Global()\n' +
            '@Module({\n' +
            '  imports: [\n' +
            '    ConfigModule.forRoot({\n' +
            "      configPrefix: 'devon4node',\n" +
            '      configType: Config,\n' +
            '    }),\n' +
            '  ],\n' +
            '  controllers: [],\n' +
            '  providers: [\n' +
            '    { provide: APP_FILTER, useClass: BusinessLogicFilter },\n' +
            '    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },\n' +
            '    WinstonLogger,\n' +
            '  ],\n' +
            '  exports: [ConfigModule, WinstonLogger],\n' +
            '})\n' +
            'export class CoreModule {}\n',
        );
      });
    });
  });
});
