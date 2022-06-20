import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Entity Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const options: Record<string, any> = {
      name: 'foo',
    };
    runner.runSchematicAsync('entity', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/model/entities/foo.entity.ts')).toBeDefined();
    });
  });
  it('should manage name and path', () => {
    const options: Record<string, any> = {
      name: 'foo',
      path: 'bar',
    };
    runner.runSchematicAsync('entity', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/bar/src/app/model/entities/foo.entity.ts')).toBeDefined();
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'fooBar',
    };
    runner.runSchematicAsync('entity', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/model/entities/foo-bar.entity.ts')).toBeDefined();
    });
  });
  it('should manage module/name', () => {
    const options: Record<string, any> = {
      name: 'foo/bar',
    };
    runner.runSchematicAsync('entity', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files.find(filename => filename === '/src/app/foo/model/entities/bar.entity.ts')).toBeDefined();
    });
  });
});
