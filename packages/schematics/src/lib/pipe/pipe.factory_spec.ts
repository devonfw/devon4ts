import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: object = {
      name: 'foo',
      flat: false,
    };
    runner.runSchematicAsync('pipe', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo/foo.pipe.ts')).toBeDefined();
      expect(tree.readContent('/app/foo/foo.pipe.ts')).toEqual(
        "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooPipe implements PipeTransform {\n' +
          '  transform(value: any, metadata: ArgumentMetadata) {\n' +
          '    return value;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name as a path', () => {
    const options: object = {
      name: 'bar/foo',
      flat: false,
    };
    runner.runSchematicAsync('pipe', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar/foo/foo.pipe.ts')).toBeDefined();
      expect(tree.readContent('/app/bar/foo/foo.pipe.ts')).toEqual(
        "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooPipe implements PipeTransform {\n' +
          '  transform(value: any, metadata: ArgumentMetadata) {\n' +
          '    return value;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: object = {
      name: 'foo',
      path: 'baz',
      flat: false,
    };
    runner.runSchematicAsync('pipe', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/baz/src/app/foo/foo.pipe.ts')).toBeDefined();
      expect(tree.readContent('/baz/src/app/foo/foo.pipe.ts')).toEqual(
        "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooPipe implements PipeTransform {\n' +
          '  transform(value: any, metadata: ArgumentMetadata) {\n' +
          '    return value;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: object = {
      name: 'fooBar',
      flat: false,
    };
    runner.runSchematicAsync('pipe', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/foo-bar/foo-bar.pipe.ts')).toBeDefined();
      expect(tree.readContent('/app/foo-bar/foo-bar.pipe.ts')).toEqual(
        "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooBarPipe implements PipeTransform {\n' +
          '  transform(value: any, metadata: ArgumentMetadata) {\n' +
          '    return value;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: object = {
      name: 'barBaz/foo',
      flat: false,
    };
    runner.runSchematicAsync('pipe', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar-baz/foo/foo.pipe.ts')).toBeDefined();
      expect(tree.readContent('/app/bar-baz/foo/foo.pipe.ts')).toEqual(
        "import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';\n" +
          '\n' +
          '@Injectable()\n' +
          'export class FooPipe implements PipeTransform {\n' +
          '  transform(value: any, metadata: ArgumentMetadata) {\n' +
          '    return value;\n' +
          '  }\n' +
          '}\n',
      );
    });
  });
});
