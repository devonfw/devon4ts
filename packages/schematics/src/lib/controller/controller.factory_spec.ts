import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner(
    '.',
    path.join(process.cwd(), 'src/collection.json'),
  );
  it('should manage name only', () => {
    const optionsApp: object = {
      name: 'project',
      spec: false,
    };
    let app;
    app = runner.runSchematicAsync('controller', optionsApp);
    app.subscribe(tree => {
      const files: string[] = tree.files;
      expect(
        files.find(filename => filename === '/src/app/controllers/project.controller.ts'),
      ).toBeDefined();
      expect(
        files.find(filename => filename === '/src/app/controllers/project.controller.spec.ts'),
      ).not.toBeDefined();
      expect(tree.readContent('/src/app/controllers/project.controller.ts')).toEqual(
        "import { Controller } from '@nestjs/common';\n" +
        '\n' +
        "@Controller('projects')\n" +
        'export class ProjectController {}\n',
      );
    })

  });
  it('should manage name and path', () => {
    const optionsApp: object = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    runner.runSchematicAsync('controller', optionsApp)
      .subscribe(tree => {
        const files: string[] = tree.files;
        expect(
          files.find(filename => filename === '/bar/src/app/controllers/foo.controller.ts'),
        ).toBeDefined();
        expect(
          files.find(filename => filename === '/bar/src/app/controllers/foo.controller.spec.ts'),
        ).toBeDefined();
        expect(tree.readContent('/bar/src/app/controllers/foo.controller.ts')).toEqual(
          "import { Controller } from '@nestjs/common';\n" +
          '\n' +
          "@Controller('foos')\n" +
          'export class FooController {}\n',
        );
      });
  });
  it('should manage name to dasherize', () => {
    const optionsApp: object = {
      name: 'fooBar',
      skipImport: true,
    };
    runner.runSchematicAsync('controller', optionsApp)
      .subscribe(tree => {
        const files: string[] = tree.files;
        expect(
          files.find(filename => filename === '/src/app/controllers/foo-bar.controller.ts'),
        ).toBeDefined();
        expect(
          files.find(
            filename => filename === '/src/app/controllers/foo-bar.controller.spec.ts',
          ),
        ).toBeDefined();
        expect(tree.readContent('/src/app/controllers/foo-bar.controller.ts')).toEqual(
          "import { Controller } from '@nestjs/common';\n" +
          '\n' +
          "@Controller('foo-bars')\n" +
          'export class FooBarController {}\n',
        );
      })

  });
  it('should manage declaration in app module', () => {
    const optionsApp: object = {
      name: '',
    };
    const optionsModule: object = {
      name: 'foo',
    };
    runner.runSchematicAsync('application', optionsApp)
      .subscribe(tree => {
        runner.runSchematicAsync('controller', optionsModule, tree)
          .subscribe(tree => {
            expect(tree.readContent(normalize('/src/app/app.module.ts'))).toEqual(
              "import { Module } from '@nestjs/common';\n" +
              "import { AppController } from './app.controller';\n" +
              "import { AppService } from './app.service';\n" +
              "import { CoreModule } from './core/core.module';\n" +
              "import { FooController } from './controllers/foo.controller';\n" +
              '\n' +
              '@Module({\n' +
              '  imports: [CoreModule],\n' +
              '  controllers: [FooController, AppController],\n' +
              '  providers: [AppService],\n' +
              '})\n' +
              'export class AppModule {}\n',
            );
          })
      })
  });
});