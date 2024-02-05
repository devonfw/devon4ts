import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Filter Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('filter', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      },
    );
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('filter', { name: 'filter', spec: false }, tree).toPromise();

    expect(tree.files).toContain('/src/app/filters/filter.filter.ts');
    expect(tree.files).not.toContain('/src/app/filters/filter.filter.spec.ts');
  });

  it('should create the filter inside src/app folder', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('filter', { name: 'filter' }, tree).toPromise();

    expect(tree.files).toContain('/src/app/filters/filter.filter.ts');
    expect(tree.files).toContain('/src/app/filters/filter.filter.spec.ts');
  });

  it('should create the filter at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('filter', { name: 'module/filter' }, tree).toPromise();

    expect(tree.files).toContain('/src/app/module/filters/filter.filter.ts');
    expect(tree.files).toContain('/src/app/module/filters/filter.filter.spec.ts');
  });
});
