import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { IResourceOptions } from './resource.factory';

describe('Resource Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const defaultResourceOptions: IResourceOptions = {
    crud: false,
    name: 'test',
    spec: true,
    type: 'rest',
  };

  it('should generate the files at src/app if executed on root directory', done => {
    const options = { ...defaultResourceOptions };
    runner.runSchematicAsync('application', { name: 'test' }).subscribe(tree => {
      runner.runSchematicAsync('resource', options, tree).subscribe(tree => {
        expect(tree.exists('/src/app/test/test.module.ts')).toBeDefined();
        expect(tree.exists('/src/app/test/controllers/test.controller.spec.ts')).toBeDefined();
        expect(tree.exists('/src/app/test/controllers/test.controller.ts')).toBeDefined();
        expect(tree.exists('/src/app/test/services/test.service.spec.ts')).toBeDefined();
        expect(tree.exists('/src/app/test/services/test.service.ts')).toBeDefined();

        done();
      });
    });
  });
  it('should generate a REST module', done => {
    const options = { ...defaultResourceOptions };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.controller.spec.ts',
        '/test/controllers/test.controller.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.controller`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../services/test.service`);

      done();
    });
  });
  it('should generate a REST module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.controller.spec.ts',
        '/test/controllers/test.controller.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.dto.ts',
        '/test/model/dtos/update-test.dto.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.controller`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../model/dtos/update-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/update-test.dto`);
      done();
    });
  });
  it('should generate a GraphQL code-first module', done => {
    const options = { ...defaultResourceOptions, type: 'graphql-code-first' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.resolver.spec.ts',
        '/test/controllers/test.resolver.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.resolver`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.resolver.ts`)).toContain(`../services/test.service`);

      done();
    });
  });
  it('should generate a GraphQL code-first module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-code-first' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.resolver.spec.ts',
        '/test/controllers/test.resolver.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.input.ts',
        '/test/model/dtos/update-test.input.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.resolver`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.resolver.ts`)).toContain(`../services/test.service`);
      done();
    });
  });
  it('should generate a GraphQL schema-first module', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.graphql',
        '/test/test.module.ts',
        '/test/controllers/test.resolver.spec.ts',
        '/test/controllers/test.resolver.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.input.ts',
        '/test/model/dtos/update-test.input.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.resolver`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.resolver.ts`)).toContain(`../services/test.service`);
      done();
    });
  });
  it('should generate a GraphQL schema-first module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'graphql-schema-first' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.graphql',
        '/test/test.module.ts',
        '/test/controllers/test.resolver.spec.ts',
        '/test/controllers/test.resolver.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.input.ts',
        '/test/model/dtos/update-test.input.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.resolver`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.resolver.ts`)).toContain(`../services/test.service`);
      done();
    });
  });
  it('should generate a microservice module', done => {
    const options = { ...defaultResourceOptions, type: 'microservice' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.controller.spec.ts',
        '/test/controllers/test.controller.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.controller`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../services/test.service`);

      done();
    });
  });
  it('should generate a microservice module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'microservice' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.controller.spec.ts',
        '/test/controllers/test.controller.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.dto.ts',
        '/test/model/dtos/update-test.dto.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.controller`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../services/test.service`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/controllers/test.controller.ts`)).toContain(`../model/dtos/update-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/update-test.dto`);
      done();
    });
  });
  it('should generate a WebSocket module', done => {
    const options = { ...defaultResourceOptions, type: 'ws' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.gateway.spec.ts',
        '/test/controllers/test.gateway.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.gateway`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.gateway.ts`)).toContain(`../services/test.service`);

      done();
    });
  });
  it('should generate a WebSocket module with CRUD', done => {
    const options = { ...defaultResourceOptions, crud: true, type: 'ws' };
    runner.runSchematicAsync('resource', options).subscribe(tree => {
      expect(tree.files).toEqual([
        '/test/test.module.ts',
        '/test/controllers/test.gateway.spec.ts',
        '/test/controllers/test.gateway.ts',
        '/test/services/test.service.spec.ts',
        '/test/services/test.service.ts',
        '/test/model/dtos/create-test.dto.ts',
        '/test/model/dtos/update-test.dto.ts',
        '/test/model/entities/test.entity.ts',
      ]);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./controllers/test.gateway`);
      expect(tree.readContent(`/test/test.module.ts`)).toContain(`./services/test.service`);
      expect(tree.readContent(`/test/controllers/test.gateway.ts`)).toContain(`../services/test.service`);
      expect(tree.readContent(`/test/controllers/test.gateway.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/controllers/test.gateway.ts`)).toContain(`../model/dtos/update-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/create-test.dto`);
      expect(tree.readContent(`/test/services/test.service.ts`)).toContain(`../model/dtos/update-test.dto`);
      done();
    });
  });
});
