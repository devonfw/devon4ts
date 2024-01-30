import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Service Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner
      .runSchematic('service', { name: 'test' })
      .then(() => {
        fail();
      })
      .catch(error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      });
  });

  it('should generate the service files', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner
      .runSchematic(
        'service',
        {
          name: 'foos',
        },
        tree,
      )
      .then();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should pluralize the name', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner
      .runSchematic(
        'service',
        {
          name: 'foo',
        },
        tree,
      )
      .then();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should skip spec files if spec is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner
      .runSchematic(
        'service',
        {
          name: 'foo',
          spec: false,
        },
        tree,
      )
      .then();

    expect(tree.files).toContain('/src/app/services/foos.service.ts');
    expect(tree.files).not.toContain('/src/app/services/foos.service.spec.ts');
  });

  it('should generate the service files inside the specified module', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner
      .runSchematic(
        'service',
        {
          name: 'foo/foo',
          spec: false,
        },
        tree,
      )
      .then();

    expect(tree.files).toContain('/src/app/foo/services/foos.service.ts');
    expect(tree.files).not.toContain('/src/app/foo/services/foos.service.spec.ts');
  });
});
