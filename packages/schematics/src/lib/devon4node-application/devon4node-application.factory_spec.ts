import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should manage name only', () => {
    const options: Record<string, any> = {
      name: 'project',
    };
    runner.runSchematicAsync('application', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/project/.prettierrc',
        '/project/nest-cli.json',
        '/project/package.json',
        '/project/README.md',
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
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
        '/project/.husky/.gitignore',
        '/project/.husky/pre-commit',
        '/project/.vscode/extensions.json',
        '/project/.vscode/settings.json',
      ]);
    });
  });
  it('should manage name to dasherize', () => {
    const options: Record<string, any> = {
      name: 'dasherizeProject',
    };
    runner.runSchematicAsync('application', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(files).toEqual([
        '/dasherize-project/.prettierrc',
        '/dasherize-project/nest-cli.json',
        '/dasherize-project/package.json',
        '/dasherize-project/README.md',
        '/dasherize-project/tsconfig.build.json',
        '/dasherize-project/tsconfig.json',
        '/dasherize-project/.eslintrc.js',
        '/dasherize-project/src/main.ts',
        '/dasherize-project/src/app/app.controller.spec.ts',
        '/dasherize-project/src/app/app.controller.ts',
        '/dasherize-project/src/app/app.module.ts',
        '/dasherize-project/src/app/app.service.ts',
        '/dasherize-project/src/app/core/core.module.ts',
        '/dasherize-project/src/app/shared/exceptions/business-logic.exception.ts',
        '/dasherize-project/src/app/shared/filters/business-logic.filter.spec.ts',
        '/dasherize-project/src/app/shared/filters/business-logic.filter.ts',
        '/dasherize-project/src/app/shared/logger/winston.logger.ts',
        '/dasherize-project/test/app.e2e-spec.ts',
        '/dasherize-project/test/jest-e2e.json',
        '/dasherize-project/.husky/.gitignore',
        '/dasherize-project/.husky/pre-commit',
        '/dasherize-project/.vscode/extensions.json',
        '/dasherize-project/.vscode/settings.json',
      ]);
    });
  });
});
