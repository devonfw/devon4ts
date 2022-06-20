import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Repository Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should manage name only', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      name: 'project',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('repository', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/src/app/model/entities/project.entity.ts')).toBeDefined();
        expect(files.find(filename => filename === '/src/app/repositories/project.repository.ts')).toBeDefined();
        expect(tree.readContent('/src/app/model/entities/project.entity.ts')).toEqual(
          "import { Entity } from 'typeorm';\n" +
            "import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';\n" +
            '\n' +
            '@Entity()\n' +
            'export class Project extends BaseEntity {}\n',
        );
        expect(tree.readContent('/src/app/repositories/project.repository.ts')).toEqual(
          "import { Project } from '../model/entities/project.entity';\n" +
            "import { Repository, EntityRepository } from 'typeorm';\n" +
            '\n' +
            '@EntityRepository(Project)\n' +
            'export class ProjectRepository extends Repository<Project> {}\n',
        );
      });
    });
  });
  it('should manage name and path', () => {
    const app: Record<string, any> = {
      name: 'app',
    };
    const options: Record<string, any> = {
      name: 'project',
      path: 'app',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('repository', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/app/src/app/model/entities/project.entity.ts')).toBeDefined();
        expect(files.find(filename => filename === '/app/src/app/repositories/project.repository.ts')).toBeDefined();
      });
    });
  });
  it('should manage name to dasherize', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      name: 'fooBar',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('repository', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/src/app/model/entities/foo-bar.entity.ts')).toBeDefined();
        expect(files.find(filename => filename === '/src/app/repositories/foo-bar.repository.ts')).toBeDefined();
      });
    });
  });
});
