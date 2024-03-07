import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/application';
import convictGenerator from '../convict/convict';
import initOrmGenerator from './orm';
import { InitTypeormGeneratorSchema } from './schema';

describe('init-typeorm generator', () => {
  describe('not typeorm orm', () => {
    let tree: Tree;
    const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql', orm: 'prisma' };

    beforeAll(async () => {
      tree = createTreeWithEmptyWorkspace();
      await applicationGenerator(tree, {
        name: options.projectName,
        projectNameAndRootFormat: 'as-provided',
        directory: 'apps/test',
      });
      await initOrmGenerator(tree, options);
    }, 60000);

    it('should run successfully', async () => {
      const appConfig = readProjectConfiguration(tree, options.projectName);
      expect(appConfig).toBeDefined();
    });
  });

  describe('typeorm', () => {
    describe('without convict', () => {
      let tree: Tree;
      const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql', orm: 'typeorm' };

      beforeEach(async () => {
        tree = createTreeWithEmptyWorkspace();
        await applicationGenerator(tree, {
          name: options.projectName,
          projectNameAndRootFormat: 'as-provided',
          directory: 'apps/test',
        });
      }, 60000);

      it('should run successfully', async () => {
        await initOrmGenerator(tree, options);
        const appConfig = readProjectConfiguration(tree, options.projectName);
        expect(tree.exists(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)).toBeFalsy();
        expect(appConfig).toBeDefined();
      });

      it('should update package.json dependencies', async () => {
        await initOrmGenerator(tree, options);
        const packageJson = tree.read('package.json')?.toString('utf-8');
        expect(packageJson).toMatchSnapshot();
      });

      it('should update the core.module with mysql configuration', async () => {
        await initOrmGenerator(tree, options);
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with mariadb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mariadb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with sqlite configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'sqlite' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with postgres configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'postgres' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with cockroachdb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'cockroachdb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with mssql configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mssql' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with oracle configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'oracle' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the core.module with mongodb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mongodb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });
    });

    describe('with convict', () => {
      let tree: Tree;
      const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql', orm: 'typeorm' };

      beforeEach(async () => {
        tree = createTreeWithEmptyWorkspace();
        await applicationGenerator(tree, {
          name: options.projectName,
          projectNameAndRootFormat: 'as-provided',
          directory: 'apps/test',
        });
        await convictGenerator(tree, { projectName: options.projectName });
        await initOrmGenerator(tree, options);
      }, 60000);

      it('should run successfully', async () => {
        await initOrmGenerator(tree, options);
        const appConfig = readProjectConfiguration(tree, options.projectName);
        expect(appConfig).toBeDefined();
      });

      it('should update the core.module with async typeorm configuration', async () => {
        await initOrmGenerator(tree, options);
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with mysql configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mysql' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with mariadb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mariadb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with sqlite configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'sqlite' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with postgres configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'postgres' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with cockroachdb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'cockroachdb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with mssql configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mssql' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with oracle configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'oracle' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });

      it('should update the config files with mongodb configuration', async () => {
        await initOrmGenerator(tree, { ...options, db: 'mongodb' });
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
        expect(
          tree.read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)?.toString('utf-8'),
        ).toMatchSnapshot();
      });
    });
  });

  describe('merge the docker compose', () => {
    let tree: Tree;
    const options: InitTypeormGeneratorSchema = { projectName: 'test', db: 'mysql', orm: 'prisma' };

    beforeEach(async () => {
      tree = createTreeWithEmptyWorkspace();
      await applicationGenerator(tree, {
        name: options.projectName,
        projectNameAndRootFormat: 'as-provided',
        directory: 'apps/test',
      });
    }, 60000);

    it('should merge the mysql docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'mysql' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the mariadb docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'mariadb' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the cockroachdb docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'cockroachdb' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the mongodb docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'mongodb' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the mssql docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'mssql' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the oracle docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'oracle' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the postgres docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'postgres' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });

    it('should merge the sqlite docker compose', async () => {
      await initOrmGenerator(tree, { ...options, db: 'sqlite' });
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });
  });
});
