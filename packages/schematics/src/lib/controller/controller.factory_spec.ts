import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const optionsApp: Record<string, any> = {
      name: 'project',
      spec: false,
    };
    runner.runSchematicAsync('controller', optionsApp).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/controllers/projects.controller.ts')).toBeDefined();
      expect(files.find(filename => filename === '/src/app/controllers/projects.controller.spec.ts')).not.toBeDefined();
      expect(tree.readContent('/src/app/controllers/projects.controller.ts')).toEqual(
        "import { Controller } from '@nestjs/common';\n" +
          '\n' +
          "@Controller('projects')\n" +
          'export class ProjectsController {}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const optionsApp: Record<string, any> = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    runner.runSchematicAsync('controller', optionsApp).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/bar/src/app/controllers/foos.controller.ts')).toBeDefined();
      expect(files.find(filename => filename === '/bar/src/app/controllers/foos.controller.spec.ts')).toBeDefined();
      expect(tree.readContent('/bar/src/app/controllers/foos.controller.ts')).toEqual(
        "import { Controller } from '@nestjs/common';\n" +
          '\n' +
          "@Controller('foos')\n" +
          'export class FoosController {}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const optionsApp: Record<string, any> = {
      name: 'fooBar',
      skipImport: true,
    };
    runner.runSchematicAsync('controller', optionsApp).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/controllers/foo-bars.controller.ts')).toBeDefined();
      expect(files.find(filename => filename === '/src/app/controllers/foo-bars.controller.spec.ts')).toBeDefined();
      expect(tree.readContent('/src/app/controllers/foo-bars.controller.ts')).toEqual(
        "import { Controller } from '@nestjs/common';\n" +
          '\n' +
          "@Controller('foo-bars')\n" +
          'export class FooBarsController {}\n',
      );
    });
  });
  it('should manage declaration in app module', () => {
    const optionsApp: Record<string, any> = {
      name: '',
    };
    const optionsModule: Record<string, any> = {
      name: 'foo',
    };
    runner.runSchematicAsync('application', optionsApp).subscribe(tree => {
      runner.runSchematicAsync('controller', optionsModule, tree).subscribe(tree => {
        expect(tree.readContent(normalize('/src/app/app.module.ts'))).toEqual(
          "import { Module } from '@nestjs/common';\n" +
            "import { AppController } from './app.controller';\n" +
            "import { AppService } from './app.service';\n" +
            "import { CoreModule } from './core/core.module';\n" +
            "import { FoosController } from './controllers/foos.controller';\n" +
            '\n' +
            '@Module({\n' +
            '  imports: [CoreModule],\n' +
            '  controllers: [FoosController, AppController],\n' +
            '  providers: [AppService],\n' +
            '})\n' +
            'export class AppModule {}\n',
        );
      });
    });
  });
});
