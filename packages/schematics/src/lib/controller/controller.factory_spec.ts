import { normalize } from '@angular-devkit/core';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { IControllerOptions } from './controller.factory';

describe('Controller Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('controller', { name: 'controller' }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the controller files the current app', async () => {
    const optionsApp: IControllerOptions = {
      name: 'project',
    };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('controller', optionsApp, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/controllers/projects.controller.ts',
        '/src/app/controllers/projects.controller.spec.ts',
      ]),
    );
  });

  it("shouldn't generate the spec if spec option is false", async () => {
    const optionsApp: IControllerOptions = {
      name: 'project',
      spec: false,
    };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('controller', optionsApp, tree).toPromise();

    expect(tree.files).not.toContain('/src/app/controllers/projects.controller.spec.ts');
  });

  it('should generate the controller at the specified module', async () => {
    const optionsApp: IControllerOptions = {
      name: 'fooBar/fooBar',
    };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('controller', optionsApp, tree).toPromise();
    tree = await runner.runSchematicAsync('module', { name: 'fooBar' }, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/foo-bar/controllers/foo-bars.controller.ts',
        '/src/app/foo-bar/controllers/foo-bars.controller.spec.ts',
      ]),
    );
  });

  it('should add the controllers to its module', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('module', { name: 'foo' }, tree).toPromise();
    tree = await runner.runSchematicAsync('controller', { name: 'foo/foo' }, tree).toPromise();

    const fooModuleContent = tree.readContent(normalize('/src/app/foo/foo.module.ts'));
    expect(fooModuleContent).toContain("import { FoosController } from './controllers/foos.controller';");
    expect(fooModuleContent).toMatch(/controllers: \[(.|\n)*FoosController(.|\n)*\]/g);
  });

  it('should add the controllers to app module if no other module is specified', async () => {
    const optionsApp: IControllerOptions = {
      name: '',
    };
    const optionsModule: IControllerOptions = {
      name: 'foo',
    };
    let tree = await runner.runSchematicAsync('application', optionsApp).toPromise();
    tree = await runner.runSchematicAsync('controller', optionsModule, tree).toPromise();

    const fooModuleContent = tree.readContent(normalize('/src/app/app.module.ts'));
    expect(fooModuleContent).toContain("import { FoosController } from './controllers/foos.controller';");
    expect(fooModuleContent).toMatch(/controllers: \[(.|\n)*FoosController(.|\n)*\]/g);
  });
});
