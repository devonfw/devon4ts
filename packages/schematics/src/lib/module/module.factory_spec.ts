import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Module Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: Record<string, any> = {
      name: 'foo',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo/foo.module.ts')).toBeDefined();
      expect(tree.readContent('/app/foo/foo.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
      );
    });
  });
  it('should manage name as a path', () => {
    const options: Record<string, any> = {
      name: 'bar/foo',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar/foo/foo.module.ts')).toBeDefined();
      expect(tree.readContent('/app/bar/foo/foo.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/bar/app/foo/foo.module.ts')).toBeDefined();
      expect(tree.readContent('/bar/app/foo/foo.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'fooBar',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo-bar/foo-bar.module.ts')).toBeDefined();
      expect(tree.readContent('/app/foo-bar/foo-bar.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooBarModule {}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'foo',
      path: 'bar',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/bar/app/foo/foo.module.ts')).toBeDefined();
      expect(tree.readContent('/bar/app/foo/foo.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: Record<string, any> = {
      name: 'barBaz/foo',
      skipImport: true,
    };
    runner.runSchematicAsync('module', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar-baz/foo/foo.module.ts')).toBeDefined();
      expect(tree.readContent('/app/bar-baz/foo/foo.module.ts')).toEqual(
        "import { Module } from '@nestjs/common';\n" + '\n' + '@Module({})\n' + 'export class FooModule {}\n',
      );
    });
  });
  it('should manage declaration in app module', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      name: 'foo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('module', options, tree).subscribe(tree => {
        expect(tree.readContent(normalize('/src/app/app.module.ts'))).toEqual(
          "import { Module } from '@nestjs/common';\n" +
            "import { AppController } from './app.controller';\n" +
            "import { AppService } from './app.service';\n" +
            "import { CoreModule } from './core/core.module';\n" +
            "import { FooModule } from './foo/foo.module';\n" +
            '\n' +
            '@Module({\n' +
            '  imports: [CoreModule, FooModule],\n' +
            '  controllers: [AppController],\n' +
            '  providers: [AppService],\n' +
            '})\n' +
            'export class AppModule {}\n',
        );
      });
    });
  });
  it('should manage declaration in bar module', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const optionsModule: Record<string, any> = {
      name: 'bar',
    };
    const options: Record<string, any> = {
      name: 'bar/foo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('module', optionsModule, tree).subscribe(tree => {
        runner.runSchematicAsync('module', options, tree).subscribe(tree => {
          expect(tree.readContent(normalize('/src/app/bar/bar.module.ts'))).toEqual(
            "import { Module } from '@nestjs/common';\n" +
              "import { FooModule } from './foo/foo.module';\n" +
              '\n' +
              '@Module({\n' +
              '  imports: [FooModule]\n' +
              '})\n' +
              'export class BarModule {}\n',
          );
        });
      });
    });
  });
});
