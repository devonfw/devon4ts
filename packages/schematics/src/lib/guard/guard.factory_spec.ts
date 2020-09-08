import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
describe('Guard Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only and create spec file', () => {
    const options: object = {
      name: 'foo',
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo.guard.ts')).toBeDefined();
      expect(files.find(filename => filename === '/app/foo.guard.spec.ts')).toBeDefined();
      expect(tree.readContent('/app/foo.guard.ts')).toEqual(
        "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooGuard implements CanActivate {\n' +
          '  canActivate(\n' +
          '    context: ExecutionContext,\n' +
          '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
          '    return true;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name has a path', () => {
    const options: object = {
      name: 'bar/foo',
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar/foo.guard.ts')).toBeDefined();
      expect(tree.readContent('/app/bar/foo.guard.ts')).toEqual(
        "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooGuard implements CanActivate {\n' +
          '  canActivate(\n' +
          '    context: ExecutionContext,\n' +
          '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
          '    return true;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: object = {
      name: 'foo',
      path: 'baz',
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/baz/src/app/guards/foo.guard.ts')).toBeDefined();
      expect(tree.readContent('/baz/src/app/guards/foo.guard.ts')).toEqual(
        "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooGuard implements CanActivate {\n' +
          '  canActivate(\n' +
          '    context: ExecutionContext,\n' +
          '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
          '    return true;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: object = {
      name: 'fooBar',
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo-bar.guard.ts')).toBeDefined();
      expect(tree.readContent('/app/foo-bar.guard.ts')).toEqual(
        "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooBarGuard implements CanActivate {\n' +
          '  canActivate(\n' +
          '    context: ExecutionContext,\n' +
          '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
          '    return true;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: object = {
      name: 'barBaz/foo',
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar-baz/foo.guard.ts')).not.toBeUndefined();
      expect(tree.readContent('/app/bar-baz/foo.guard.ts')).toEqual(
        "import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooGuard implements CanActivate {\n' +
          '  canActivate(\n' +
          '    context: ExecutionContext,\n' +
          '  ): boolean | Promise<boolean> | Observable<boolean> {\n' +
          '    return true;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should be undefined if no spec file', () => {
    const options: object = {
      name: 'foo',
      spec: false,
    };
    runner.runSchematicAsync('guard', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo.guard.spec.ts')).toBeUndefined();
      expect(files.find(filename => filename === '/app/foo.guard.ts')).toBeDefined();
    });
  });
});
