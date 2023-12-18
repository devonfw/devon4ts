import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { join } from 'path';

describe('Application Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  const defaultOptions: Record<string, any> = {
    name: 'project',
  };

  it('should generate all NestJS and devon4node files', done => {
    runner.runSchematicAsync('application', defaultOptions).subscribe(tree => {
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
        '/project/src/app/shared/exceptions/entity-not-found.exception.ts',
        '/project/src/app/shared/filters/entity-not-found.filter.ts',
        '/project/src/app/shared/logger/winston.logger.ts',
        '/project/test/app.e2e-spec.ts',
        '/project/test/jest-e2e.json',
        '/project/.husky/.gitignore',
        '/project/.husky/pre-commit',
        '/project/.vscode/extensions.json',
        '/project/.vscode/settings.json',
      ]);
      done();
    });
  });

  it('should dasherize the application name', done => {
    const options: Record<string, any> = {
      name: 'dasherizeProject',
    };
    runner.runSchematicAsync('application', options).subscribe(tree => {
      const files: string[] = tree.files;
      expect(
        files.map(elem => elem.startsWith('/dasherize-project/')).reduce((prev, curr) => prev && curr, true),
      ).toBeTruthy();
      done();
    });
  });

  it('should override .prettierrc content', done => {
    readFile(join(__dirname, './files/.prettierrc'))
      .then(buffer => buffer.toString())
      .then(content => {
        runner.runSchematicAsync('application', defaultOptions).subscribe(tree => {
          expect(tree.readContent('/project/.prettierrc').trimEnd()).toStrictEqual(content.trimEnd());
          done();
        });
      });
  });

  it('should add CoreModule to AppModule imports', done => {
    runner.runSchematicAsync('application', defaultOptions).subscribe(tree => {
      const appModuleContent = tree.readContent('/project/src/app/app.module.ts');
      expect(appModuleContent).toContain("import { CoreModule } from './core/core.module'");

      expect(appModuleContent).toMatch(/[.\n]*imports: \[.*CoreModule.*\][.\n]*/);
      done();
    });
  });

  it('should update main.ts to add versioning, logger and validation pipe', done => {
    runner.runSchematicAsync('application', defaultOptions).subscribe(tree => {
      const appModuleContent = tree.readContent('/project/src/main.ts');
      expect(appModuleContent).toContain("import { WinstonLogger } from './app/shared/logger/winston.logger'");
      expect(appModuleContent).toContain(
        "import { EntityNotFoundFilter } from './app/shared/filters/entity-not-found.filter'",
      );
      expect(appModuleContent).toMatch(
        /[.\n]*import {.*(ValidationPipe|VersioningType).*(ValidationPipe|VersioningType).*} from '@nestjs\/common';[.\n]*/,
      );
      expect(appModuleContent).toContain('app.enableVersioning');
      expect(appModuleContent).toContain(`NestFactory.create(AppModule, { bufferLogs: true });

  const logger = await app.resolve(WinstonLogger);
  app.useLogger(logger);`);
      expect(appModuleContent).toContain(`app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        excludeExtraneousValues: true,
      },
    }),
  );
  app.useGlobalFilters(new EntityNotFoundFilter(logger));`);
      done();
    });
  });
});
