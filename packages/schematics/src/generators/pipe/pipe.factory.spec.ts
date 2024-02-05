import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Pipe Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner
      .runSchematic('pipe', { name: 'foo' })
      .then(() => {
        fail();
      })
      .catch(error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      });
  });

  it('should create the pipe inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('pipe', { name: 'pipe' }, tree).then();

    expect(tree.files).toContain('/src/app/pipes/pipe.pipe.ts');
    expect(tree.files).toContain('/src/app/pipes/pipe.pipe.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('pipe', { name: 'pipe', spec: false }, tree).then();

    expect(tree.files).toContain('/src/app/pipes/pipe.pipe.ts');
    expect(tree.files).not.toContain('/src/app/pipes/pipe.pipe.spec.ts');
  });

  it('should create the pipe at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('pipe', { name: 'module/pipe' }, tree).then();

    expect(tree.files).toContain('/src/app/module/pipes/pipe.pipe.ts');
    expect(tree.files).toContain('/src/app/module/pipes/pipe.pipe.spec.ts');
  });
});
