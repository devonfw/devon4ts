import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('service', { name: 'test' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the service files', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner
      .runSchematicAsync(
        'service',
        {
          name: 'foos',
        },
        tree,
      )
      .toPromise();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should pluralize the name', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner
      .runSchematicAsync(
        'service',
        {
          name: 'foo',
        },
        tree,
      )
      .toPromise();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should skip spec files if spec is false', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner
      .runSchematicAsync(
        'service',
        {
          name: 'foo',
          spec: false,
        },
        tree,
      )
      .toPromise();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).not.toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should generate the service files inside the specified module', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner
      .runSchematicAsync(
        'service',
        {
          name: 'foo/foo',
          spec: false,
        },
        tree,
      )
      .toPromise();

    expect(tree.files).toContain('/src/app/foo/services/foos.service.ts');
    expect(tree.files).not.toContain('/src/app/foo/services/foos.service.spec.ts');
  });
});
