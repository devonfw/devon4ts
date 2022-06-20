import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: Record<string, any> = {
      name: 'foo',
    };
    runner.runSchematicAsync('service', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/services/foos.service.ts')).toBeDefined();
      expect(files.find(filename => filename === '/src/app/services/foos.service.spec.ts')).toBeDefined();
      expect(tree.readContent('/src/app/services/foos.service.ts')).toEqual(
        "import { Injectable } from '@nestjs/common';\n" + '\n' + '@Injectable()\n' + 'export class FoosService {}\n',
      );
    });
  });
  it('should manage name as a path', () => {
    const options: Record<string, any> = {
      name: 'bar/foo',
    };
    runner.runSchematicAsync('service', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/bar/services/foos.service.ts')).toBeDefined();
      expect(tree.readContent('/src/app/bar/services/foos.service.ts')).toEqual(
        "import { Injectable } from '@nestjs/common';\n" + '\n' + '@Injectable()\n' + 'export class FoosService {}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'foo',
      path: 'bar',
    };
    runner.runSchematicAsync('service', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/bar/src/app/services/foos.service.ts')).toBeDefined();
      expect(tree.readContent('/bar/src/app/services/foos.service.ts')).toEqual(
        "import { Injectable } from '@nestjs/common';\n" + '\n' + '@Injectable()\n' + 'export class FoosService {}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'fooBar',
    };
    runner.runSchematicAsync('service', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/services/foo-bars.service.ts')).toBeDefined();
      expect(tree.readContent('/src/app/services/foo-bars.service.ts')).toEqual(
        "import { Injectable } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooBarsService {}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: Record<string, any> = {
      name: 'barBaz/foo',
      skipImport: true,
      flat: true,
    };
    runner.runSchematicAsync('service', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/bar-baz/services/foos.service.ts')).toBeDefined();
      expect(tree.readContent('/src/app/bar-baz/services/foos.service.ts')).toEqual(
        "import { Injectable } from '@nestjs/common';\n" + '\n' + '@Injectable()\n' + 'export class FoosService {}\n',
      );
    });
  });
  it('should manage declaration in app module', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      name: 'foo',
      flat: true,
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('service', options, tree).subscribe(tree => {
        expect(tree.readContent(normalize('/src/app/app.module.ts'))).toEqual(
          "import { Module } from '@nestjs/common';\n" +
            "import { AppController } from './app.controller';\n" +
            "import { AppService } from './app.service';\n" +
            "import { CoreModule } from './core/core.module';\n" +
            "import { FoosService } from './services/foos.service';\n" +
            '\n' +
            '@Module({\n' +
            '  imports: [CoreModule],\n' +
            '  controllers: [AppController],\n' +
            '  providers: [FoosService, AppService],\n' +
            '})\n' +
            'export class AppModule {}\n',
        );
      });
    });
  });
  it('should manage declaration in foo module', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const obtionsModule: Record<string, any> = {
      name: 'foo',
    };
    const options: Record<string, any> = {
      name: 'foo',
      path: 'foo',
      flat: true,
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('module', obtionsModule, tree).subscribe(tree => {
        runner.runSchematicAsync('service', options, tree).subscribe(tree => {
          expect(tree.readContent(normalize('/src/app/foo/foo.module.ts'))).toEqual(
            "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
          );
        });
      });
    });
  });
});
