import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Auth Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should set on module app', async () => {
    const optionsApp: Record<string, any> = {
      name: 'path',
    };
    const optionsModule: Record<string, any> = {
      path: 'path',
    };
    let app;
    app = runner.runSchematicAsync('application', optionsApp);
    app.subscribe(async tree => {
      app = runner.runSchematicAsync('auth-jwt', optionsModule, tree);
      app.subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/path/src/app/core/core.module.ts')).toBeDefined();
        expect(tree.readContent('/path/src/app/core/core.module.ts')).toEqual(
          "import { ClassSerializerInterceptor, Global, Module } from '@nestjs/common';\n" +
            "import { APP_INTERCEPTOR } from '@nestjs/core';\n" +
            "import { WinstonLogger } from '../shared/logger/winston.logger';\n" +
            "import { AuthModule } from './auth/auth.module';\n" +
            "import { UserModule } from './user/user.module';\n" +
            '\n' +
            '@Global()\n' +
            '@Module({\n' +
            '  imports: [UserModule, AuthModule],\n' +
            '  controllers: [],\n' +
            '  providers: [{ provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor }, WinstonLogger],\n' +
            '  exports: [UserModule, AuthModule, WinstonLogger],\n' +
            '})\n' +
            'export class CoreModule {}\n',
        );
      });
    });
  });
});
