import {
  SchematicTestRunner
} from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Auth Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should set on module app', async () => {
    const optionsApp: object = {
      name: 'path',
    };
    const optionsModule: object = {
      path: 'path'
    };
    let app;
    app = await runner.runSchematicAsync('application', optionsApp);
    app.subscribe(async tree => {
      app = await runner.runSchematicAsync('auth-jwt', optionsModule, tree);
      app.subscribe(tree => {
        const files: string[] = tree.files;
        expect(
          files.find(filename => filename === '/path/src/app/core/core.module.ts'),
        ).toBeDefined();
        expect(tree.readContent('/path/src/app/core/core.module.ts')).toEqual(
          "import { Global, Module } from '@nestjs/common';\n" +
          "import { ClassSerializerInterceptor } from '@devon4node/common/serializer';\n" +
          "import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';\n" +
          "import { WinstonLogger } from '../shared/logger/winston.logger';\n" +
          "import { BusinessLogicFilter } from '../shared/filters/business-logic.filter';\n" +
          "import { AuthModule } from './auth/auth.module';\n" +
          "import { UserModule } from './user/user.module';\n" +
          "\n" +
          "@Global()\n" +
          "@Module({\n" +
          "  imports: [UserModule, AuthModule],\n" +
          "  controllers: [],\n" +
          "  providers: [\n" +
          "    { provide: APP_FILTER, useClass: BusinessLogicFilter },\n" +
          "    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },\n" +
          "    WinstonLogger,\n" +
          "  ],\n" +
          "  exports: [UserModule, AuthModule, WinstonLogger],\n" +
          "})\n" +
          "export class CoreModule {}\n"
        );
      })
    })
  });
});