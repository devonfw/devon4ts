import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Interceptor Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner
      .runSchematic('interceptor', { name: 'foo' })
      .then(() => {
        fail();
      })
      .catch(error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      });
  });

  it('should create the interceptor inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('interceptor', { name: 'interceptor' }, tree).then();

    expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
    expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('interceptor', { name: 'interceptor', spec: false }, tree).then();

    expect(tree.files).toContain('/src/app/interceptors/interceptor.interceptor.ts');
    expect(tree.files).not.toContain('/src/app/interceptors/interceptor.interceptor.spec.ts');
  });

  it('should create the interceptor at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('interceptor', { name: 'module/interceptor' }, tree).then();

    expect(tree.files).toContain('/src/app/module/interceptors/interceptor.interceptor.ts');
    expect(tree.files).toContain('/src/app/module/interceptors/interceptor.interceptor.spec.ts');
  });
});
