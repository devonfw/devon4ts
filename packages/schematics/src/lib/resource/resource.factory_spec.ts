import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { IResourceOptions } from './resource.factory';

describe('Resource Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const defaultResourceOptions: IResourceOptions = {
    crud: false,
    name: 'tests',
    spec: true,
    type: 'rest',
  };

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('resource', { ...defaultResourceOptions }).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate the files at src/app if executed on root directory', async () => {
    const options = { ...defaultResourceOptions };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.exists('/src/app/tests/tests.module.ts')).toBeDefined();
    expect(tree.exists('/src/app/tests/controllers/tests.controller.spec.ts')).toBeDefined();
    expect(tree.exists('/src/app/tests/controllers/tests.controller.ts')).toBeDefined();
    expect(tree.exists('/src/app/tests/services/tests.service.spec.ts')).toBeDefined();
    expect(tree.exists('/src/app/tests/services/tests.service.ts')).toBeDefined();
  });

  it('should generate a REST module', async () => {
    const options = { ...defaultResourceOptions };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.controller.spec.ts',
        '/src/app/tests/controllers/tests.controller.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a REST module with CRUD', async () => {
    const options = { ...defaultResourceOptions, crud: true };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.controller.spec.ts',
        '/src/app/tests/controllers/tests.controller.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.dto.ts',
        '/src/app/tests/model/dtos/update-test.dto.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(`../services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
      `../model/dtos/create-test.dto`,
    );
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
      `../model/dtos/update-test.dto`,
    );
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
  });

  it('should generate a GraphQL code-first module', async () => {
    const options = { ...defaultResourceOptions, type: 'graphql-code-first' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.resolver.spec.ts',
        '/src/app/tests/controllers/tests.resolver.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a GraphQL code-first module with CRUD', async () => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-code-first' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.resolver.spec.ts',
        '/src/app/tests/controllers/tests.resolver.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.input.ts',
        '/src/app/tests/model/dtos/update-test.input.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a GraphQL schema-first module', async () => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.graphql',
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.resolver.spec.ts',
        '/src/app/tests/controllers/tests.resolver.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.input.ts',
        '/src/app/tests/model/dtos/update-test.input.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a GraphQL schema-first module with CRUD', async () => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.graphql',
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.resolver.spec.ts',
        '/src/app/tests/controllers/tests.resolver.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.input.ts',
        '/src/app/tests/model/dtos/update-test.input.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.resolver`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.resolver.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a microservice module', async () => {
    const options = { ...defaultResourceOptions, type: 'microservice' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.controller.spec.ts',
        '/src/app/tests/controllers/tests.controller.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a microservice module with CRUD', async () => {
    const options = { ...defaultResourceOptions, crud: true, type: 'microservice' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.controller.spec.ts',
        '/src/app/tests/controllers/tests.controller.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.dto.ts',
        '/src/app/tests/model/dtos/update-test.dto.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.controller`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(`../services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
      `../model/dtos/create-test.dto`,
    );
    expect(tree.readContent(`/src/app/tests/controllers/tests.controller.ts`)).toContain(
      `../model/dtos/update-test.dto`,
    );
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
  });

  it('should generate a WebSocket module', async () => {
    const options = { ...defaultResourceOptions, type: 'ws' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.gateway.spec.ts',
        '/src/app/tests/controllers/tests.gateway.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.gateway`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../services/tests.service`);
  });

  it('should generate a WebSocket module with CRUD', async () => {
    const options = { ...defaultResourceOptions, crud: true, type: 'ws' };
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('resource', options, tree).toPromise();

    expect(tree.files).toEqual(
      expect.arrayContaining([
        '/src/app/tests/tests.module.ts',
        '/src/app/tests/controllers/tests.gateway.spec.ts',
        '/src/app/tests/controllers/tests.gateway.ts',
        '/src/app/tests/services/tests.service.spec.ts',
        '/src/app/tests/services/tests.service.ts',
        '/src/app/tests/model/dtos/create-test.dto.ts',
        '/src/app/tests/model/dtos/update-test.dto.ts',
        '/src/app/tests/model/entities/test.entity.ts',
      ]),
    );
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./controllers/tests.gateway`);
    expect(tree.readContent(`/src/app/tests/tests.module.ts`)).toContain(`./services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../services/tests.service`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../model/dtos/create-test.dto`);
    expect(tree.readContent(`/src/app/tests/controllers/tests.gateway.ts`)).toContain(`../model/dtos/update-test.dto`);
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/create-test.dto`);
    expect(tree.readContent(`/src/app/tests/services/tests.service.ts`)).toContain(`../model/dtos/update-test.dto`);
  });
});
