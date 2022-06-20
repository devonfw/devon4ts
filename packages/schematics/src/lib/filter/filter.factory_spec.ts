import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Filter Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should manage name only and create a spec file', () => {
    const options: Record<string, any> = {
      name: 'filter',
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/filter.filter.ts')).toBeDefined();
      expect(files.find(filename => filename === '/app/filter.filter.spec.ts')).toBeDefined();
      expect(tree.readContent('/app/filter.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
  it('should manage name has a path', () => {
    const options: Record<string, any> = {
      name: 'bar/filter',
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar/filter.filter.ts')).toBeDefined();
      expect(tree.readContent('/app/bar/filter.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'filter',
      path: 'baz',
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/baz/src/app/filters/filter.filter.ts')).toBeDefined();
      expect(tree.readContent('/baz/src/app/filters/filter.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'filterBar',
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/filter-bar.filter.ts')).toBeDefined();
      expect(tree.readContent('/app/filter-bar.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterBarFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
  it('should manage path to dasherize', () => {
    const options: Record<string, any> = {
      name: 'barBaz/filter',
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/bar-baz/filter.filter.ts')).toBeDefined();
      expect(tree.readContent('/app/bar-baz/filter.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
  it('should add source root to path', () => {
    const options: Record<string, any> = {
      name: 'filter',
      sourceRoot: 'sourceroot',
    };
    runner.runSchematicAsync('application', { name: '' }).subscribe(tree => {
      runner.runSchematicAsync('filter', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/sourceroot/app/filter.filter.ts')).toBeDefined();
        expect(tree.readContent('/sourceroot/app/filter.filter.ts')).toEqual(
          "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
            '\n' +
            '@Catch()\n' +
            'export class FilterFilter<T> implements ExceptionFilter {\n' +
            '  catch(exception: T, host: ArgumentsHost) {}\n' +
            '}\n',
        );
      });
    });
  });
  it('should not create spec files', () => {
    const options: Record<string, any> = {
      name: 'filter',
      spec: false,
    };
    runner.runSchematicAsync('filter', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/app/filter.filter.ts')).toBeDefined();
      expect(files.find(filename => filename === '/app/filter.filter.spec.ts')).toBeUndefined();
      expect(tree.readContent('/app/filter.filter.ts')).toEqual(
        "import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';\n" +
          '\n' +
          '@Catch()\n' +
          'export class FilterFilter<T> implements ExceptionFilter {\n' +
          '  catch(exception: T, host: ArgumentsHost) {}\n' +
          '}\n',
      );
    });
  });
});
