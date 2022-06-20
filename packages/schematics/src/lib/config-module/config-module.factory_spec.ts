import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Config-module', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage path', async () => {
    const optionsApp: Record<string, unknown> = {
      name: 'foo',
    };
    const optionsModule: Record<string, unknown> = {
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
            "import { ValidationPipe, VersioningType } from '@nestjs/common';\n" +
            "import { EntityNotFoundFilter } from './app/shared/filters/entity-not-found.filter';\n" +
            "import { ConfigService } from '@devon4node/config';\n" +
            "import { Config } from './app/shared/model/config/config.model';\n" +
            '\n' +
            'async function bootstrap(): Promise<void> {\n' +
            '  const app = await NestFactory.create(AppModule, { bufferLogs: true });\n' +
            '  const configModule = app.get<ConfigService<Config>>(ConfigService);\n\n' +
            '  const logger = app.get(WinstonLogger);\n' +
            '  app.useLogger(logger);\n\n' +
            '  app.useGlobalPipes(\n' +
            '    new ValidationPipe({\n' +
            '      transform: true,\n' +
            '      transformOptions: {\n' +
            '        excludeExtraneousValues: true,\n' +
            '      },\n' +
            '    }),\n' +
            '  );\n' +
            '  app.useGlobalFilters(new EntityNotFoundFilter(logger));\n' +
            '  app.enableVersioning({\n' +
            '    type: VersioningType.URI,\n' +
            '    defaultVersion: configModule.values.defaultVersion,\n' +
            '  });\n' +
            '  await app.listen(configModule.values.port);\n' +
            '}\n' +
            'bootstrap();\n',
        );
      });
    });
  });
  it('should manage declaration in core module', async () => {
    const optionsApp: Record<string, unknown> = {
      name: '',
    };
    const optionsModule: Record<string, unknown> = {
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
          "import { ClassSerializerInterceptor, Global, Module } from '@nestjs/common';\n" +
            "import { APP_INTERCEPTOR } from '@nestjs/core';\n" +
            "import { WinstonLogger } from '../shared/logger/winston.logger';\n" +
            "import { ConfigModule } from '@devon4node/config';\n" +
            "import { Config } from '../shared/model/config/config.model';\n" +
            '\n' +
            '@Global()\n' +
            '@Module({\n' +
            '  imports: [\n' +
            '    ConfigModule.register({\n' +
            '      configType: Config,\n' +
            '    }),\n' +
            '  ],\n' +
            '  controllers: [],\n' +
            '  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, WinstonLogger],\n' +
            '  exports: [ConfigModule, WinstonLogger],\n' +
            '})\n' +
            'export class CoreModule {}\n',
        );
      });
    });
  });
});
