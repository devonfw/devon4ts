import { ProjectConfiguration, Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import libraryGenerator from '@nx/nest/src/generators/library/library';
import { LibraryGeneratorOptions } from '@nx/nest/src/generators/library/schema';
import { moduleGenerator } from '@nx/nest/src/generators/module/module';
import { join } from 'path';
import applicationGenerator from '../application/application';
import { entityGenerator } from './entity';

describe('entity generator', () => {
  describe('application', () => {
    let tree: Tree;
    const options: ApplicationGeneratorOptions = {
      name: 'test',
      projectNameAndRootFormat: 'as-provided',
      directory: 'apps/test',
    };
    let config: ProjectConfiguration;
    beforeEach(async () => {
      tree = createTreeWithEmptyWorkspace();
      await applicationGenerator(tree, options);
      config = readProjectConfiguration(tree, 'test');
    }, 60000);

    it('should generate the entity', async () => {
      expect(config).toBeDefined();
      await entityGenerator(tree, { name: 'testo', projectName: options.name });
      expect(tree.exists(join(config.root, 'src/app/testo.entity.ts'))).toBeTruthy();
      expect(tree.read(join(config.root, 'src/app/testo.entity.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the library module if no other module is specified', async () => {
      await entityGenerator(tree, { name: 'testo', projectName: options.name });
      expect(tree.exists(join(config.root, 'src/app/app.module.ts'))).toBeTruthy();
      expect(tree.read(join(config.root, 'src/app/app.module.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the specified module', async () => {
      await moduleGenerator(tree, {
        name: 'modulero',
        directory: 'apps/test/src/app/modulero',
        nameAndDirectoryFormat: 'as-provided',
      });
      await entityGenerator(tree, { name: 'testo', projectName: options.name, module: 'modulero' });
      expect(tree.read(join(config.root, 'src/lib/modulero/modulero.module.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should throw an error if the specified module doesnt exists', async () => {
      await expect(
        entityGenerator(tree, { name: 'testo', projectName: options.name, module: 'no-exists' }),
      ).rejects.toThrow(Error);
    });
  });

  describe('library', () => {
    let tree: Tree;
    const options: LibraryGeneratorOptions = {
      name: 'test',
      projectNameAndRootFormat: 'as-provided',
      directory: 'apps/test',
    };
    let config: ProjectConfiguration;
    beforeEach(async () => {
      tree = createTreeWithEmptyWorkspace();
      await libraryGenerator(tree, options);
      config = readProjectConfiguration(tree, 'test');
    }, 60000);

    it('should generate the entity', async () => {
      expect(config).toBeDefined();
      await entityGenerator(tree, { name: 'testo', projectName: options.name });
      expect(tree.exists(join(config.root, 'src/lib/testo.entity.ts'))).toBeTruthy();
      expect(tree.read(join(config.root, 'src/lib/testo.entity.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the library module if no other module is specified', async () => {
      await entityGenerator(tree, { name: 'testo', projectName: options.name });
      expect(tree.read(join(config.root, 'src/lib/test.module.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should update the specified module', async () => {
      await moduleGenerator(tree, {
        name: 'modulero',
        directory: 'apps/test/src/lib/modulero',
        nameAndDirectoryFormat: 'as-provided',
      });
      await entityGenerator(tree, { name: 'testo', projectName: options.name, module: 'modulero' });
      expect(tree.read(join(config.root, 'src/lib/modulero/modulero.module.ts'))?.toString('utf-8')).toMatchSnapshot();
    });

    it('should throw an error if the specified module doesnt exists', async () => {
      await expect(
        entityGenerator(tree, { name: 'testo', projectName: options.name, module: 'no-exists' }),
      ).rejects.toThrow(Error);
    });
  });
});
