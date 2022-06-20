import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only and create spec file', () => {
    const options: Record<string, any> = {
      name: 'foo',
    };
    runner.runSchematicAsync('interceptor', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo.interceptor.ts')).toBeDefined();
      expect(files.find(filename => filename === '/app/foo.interceptor.spec.ts')).toBeDefined();
      expect(tree.readContent('/app/foo.interceptor.ts')).toEqual(
        "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooInterceptor implements NestInterceptor {\n' +
          '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
          '    return next.handle();\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name as a path', () => {
    const options: Record<string, any> = {
      name: 'bar/foo',
    };
    runner.runSchematicAsync('interceptor', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar/foo.interceptor.ts')).toBeDefined();
      expect(tree.readContent('/app/bar/foo.interceptor.ts')).toEqual(
        "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooInterceptor implements NestInterceptor {\n' +
          '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
          '    return next.handle();\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'foo',
      path: 'baz',
    };
    runner.runSchematicAsync('interceptor', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/baz/src/app/interceptors/foo.interceptor.ts')).toBeDefined();
      expect(tree.readContent('/baz/src/app/interceptors/foo.interceptor.ts')).toEqual(
        "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooInterceptor implements NestInterceptor {\n' +
          '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
          '    return next.handle();\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'fooBar',
    };
    runner.runSchematicAsync('interceptor', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo-bar.interceptor.ts')).toBeDefined();
      expect(tree.readContent('/app/foo-bar.interceptor.ts')).toEqual(
        "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooBarInterceptor implements NestInterceptor {\n' +
          '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
          '    return next.handle();\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: Record<string, any> = {
      name: 'barBaz/foo',
    };
    runner.runSchematicAsync('interceptor', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar-baz/foo.interceptor.ts')).toBeDefined();
      expect(tree.readContent('/app/bar-baz/foo.interceptor.ts')).toEqual(
        "import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';\n" +
          "import { Observable } from 'rxjs';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooInterceptor implements NestInterceptor {\n' +
          '  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {\n' +
          '    return next.handle();\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
});
