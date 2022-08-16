import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Guard Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('guard', { name: 'foo' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should create the guard inside src/app folder', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('guard', { name: 'guard' }, tree).toPromise();

    expect(tree.files).toContain('/src/app/guards/guard.guard.ts');
    expect(tree.files).toContain('/src/app/guards/guard.guard.spec.ts');
  });

  it('should not generate spec if spec param is false', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('guard', { name: 'guard', spec: false }, tree).toPromise();

    expect(tree.files).toContain('/src/app/guards/guard.guard.ts');
    expect(tree.files).not.toContain('/src/app/guards/guard.guard.spec.ts');
  });

  it('should create the guard at specified module inside src/app folder', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('guard', { name: 'module/guard' }, tree).toPromise();

    expect(tree.files).toContain('/src/app/module/guards/guard.guard.ts');
    expect(tree.files).toContain('/src/app/module/guards/guard.guard.spec.ts');
  });
});
