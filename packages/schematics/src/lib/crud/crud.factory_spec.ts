import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Crud Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should manage name only', () => {
    const app: Record<string, any> = {
      name: '',
    };
    const options: Record<string, any> = {
      path: '',
      name: 'crud',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('crud', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files).toEqual([
          '/.prettierrc',
          '/README.md',
          '/nest-cli.json',
          '/package.json',
          '/tsconfig.build.json',
          '/tsconfig.json',
          '/.eslintrc.js',
          '/src/main.ts',
          '/src/app/app.controller.spec.ts',
          '/src/app/app.controller.ts',
          '/src/app/app.module.ts',
          '/src/app/app.service.ts',
          '/src/app/core/core.module.ts',
          '/src/app/shared/exceptions/business-logic.exception.ts',
          '/src/app/shared/filters/business-logic.filter.spec.ts',
          '/src/app/shared/filters/business-logic.filter.ts',
          '/src/app/shared/logger/winston.logger.ts',
          '/src/app/model/entities/crud.entity.ts',
          '/src/app/controllers/crud.controller.ts',
          '/src/app/services/crud.service.ts',
          '/test/app.e2e-spec.ts',
          '/test/jest-e2e.json',
          '/.husky/.gitignore',
          '/.husky/pre-commit',
          '/.vscode/extensions.json',
          '/.vscode/settings.json',
        ]);
      });
    });
  });
  it('should manage path', () => {
    const app: Record<string, any> = {
      name: 'project',
    };
    const options: Record<string, any> = {
      path: 'project',
      name: 'crud',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('crud', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files).toEqual([
          '/project/.prettierrc',
          '/project/README.md',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/.eslintrc.js',
          '/project/src/main.ts',
          '/project/src/app/app.controller.spec.ts',
          '/project/src/app/app.controller.ts',
          '/project/src/app/app.module.ts',
          '/project/src/app/app.service.ts',
          '/project/src/app/core/core.module.ts',
          '/project/src/app/shared/exceptions/business-logic.exception.ts',
          '/project/src/app/shared/filters/business-logic.filter.spec.ts',
          '/project/src/app/shared/filters/business-logic.filter.ts',
          '/project/src/app/shared/logger/winston.logger.ts',
          '/project/src/app/model/entities/crud.entity.ts',
          '/project/src/app/controllers/crud.controller.ts',
          '/project/src/app/services/crud.service.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/test/jest-e2e.json',
          '/project/.husky/.gitignore',
          '/project/.husky/pre-commit',
          '/project/.vscode/extensions.json',
          '/project/.vscode/settings.json',
        ]);
      });
    });
  });
  it('should manage name to split', () => {
    const app: Record<string, any> = {
      name: 'project',
    };
    const options: Record<string, any> = {
      path: 'project',
      name: 'crudFoo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('crud', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files).toEqual([
          '/project/.prettierrc',
          '/project/README.md',
          '/project/nest-cli.json',
          '/project/package.json',
          '/project/tsconfig.build.json',
          '/project/tsconfig.json',
          '/project/.eslintrc.js',
          '/project/src/main.ts',
          '/project/src/app/app.controller.spec.ts',
          '/project/src/app/app.controller.ts',
          '/project/src/app/app.module.ts',
          '/project/src/app/app.service.ts',
          '/project/src/app/core/core.module.ts',
          '/project/src/app/shared/exceptions/business-logic.exception.ts',
          '/project/src/app/shared/filters/business-logic.filter.spec.ts',
          '/project/src/app/shared/filters/business-logic.filter.ts',
          '/project/src/app/shared/logger/winston.logger.ts',
          '/project/src/app/model/entities/crud-foo.entity.ts',
          '/project/src/app/controllers/crud-foo.controller.ts',
          '/project/src/app/services/crud-foo.service.ts',
          '/project/test/app.e2e-spec.ts',
          '/project/test/jest-e2e.json',
          '/project/.husky/.gitignore',
          '/project/.husky/pre-commit',
          '/project/.vscode/extensions.json',
          '/project/.vscode/settings.json',
        ]);
      });
    });
  });
});
