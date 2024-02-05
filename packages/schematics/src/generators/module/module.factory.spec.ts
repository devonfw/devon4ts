import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Module Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner
      .runSchematic('module', { name: 'foo' })
      .then(() => {
        fail();
      })
      .catch(error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      });
  });

  it('should create the module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('module', { name: 'test' }, tree).then();

    expect(tree.files).toContain('/src/app/test/test.module.ts');
  });

  it('should create the module at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('module', { name: 'module/test' }, tree).then();

    expect(tree.files).toContain('/src/app/module/test/test.module.ts');
  });
});
