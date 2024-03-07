import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/application';
import convictGenerator from '../convict/convict';
import { mailerGenerator } from './mailer';
import { MailerGeneratorSchema } from './schema';

describe('mailer generator', () => {
  describe('mailer generator without convict', () => {
    let tree: Tree;
    const options: MailerGeneratorSchema = { projectName: 'test' };
    beforeAll(async () => {
      tree = createTreeWithEmptyWorkspace();
      await applicationGenerator(tree, {
        name: options.projectName,
        projectNameAndRootFormat: 'as-provided',
        directory: 'apps/test',
      });
      await mailerGenerator(tree, options);
    }, 60000);

    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"handlebars":/g);
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@devon4ts\/mailer":/g);
    });

    it('should generate the template files', () => {
      expect(
        tree.exists(`packages/nx-nest/apps/${options.projectName}/src/assets/templates/partials/layout.handlebars`),
      ).toBeTruthy();
      expect(
        tree.exists(`packages/nx-nest/apps/${options.projectName}/src/assets/templates/views/example.handlebars`),
      ).toBeTruthy();
    });

    it('should add MailerModule to core.module', async () => {
      const fileContent = tree
        .read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)
        ?.toString('utf-8');

      expect(fileContent).toMatchSnapshot();
    });

    it('should merge the docker-compose.yaml', () => {
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });
  });

  describe('mailer generator with convict', () => {
    let tree: Tree;
    const options: MailerGeneratorSchema = { projectName: 'test' };
    beforeAll(async () => {
      tree = createTreeWithEmptyWorkspace();
      await applicationGenerator(tree, {
        name: options.projectName,
        projectNameAndRootFormat: 'as-provided',
        directory: 'apps/test',
      });
      tree.write(
        'docker-compose.yml',
        `version: '3'
services:
  test:
    image: test`,
      );
      await convictGenerator(tree, options);
      await mailerGenerator(tree, options);
    }, 60000);

    it('should add dependencies to package.json', async () => {
      const fileContent = tree.read('package.json')?.toString('utf-8');
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"handlebars":/g);
      expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@devon4ts\/mailer":/g);
    });

    it('should generate the template files', () => {
      expect(
        tree.exists(`packages/nx-nest/apps/${options.projectName}/src/assets/templates/partials/layout.handlebars`),
      ).toBeTruthy();
      expect(
        tree.exists(`packages/nx-nest/apps/${options.projectName}/src/assets/templates/views/example.handlebars`),
      ).toBeTruthy();
    });

    it('should add MailerModule to core.module', async () => {
      const fileContent = tree
        .read(`./packages/nx-nest/apps/${options.projectName}/src/app/core/core.module.ts`)
        ?.toString('utf-8');
      expect(fileContent).toContain('MailerModule');
      expect(fileContent).toMatchSnapshot();
    });

    it('should add mailer configuration src/app/shared/app-config.ts', async () => {
      const fileContent = tree
        .read(`./packages/nx-nest/apps/${options.projectName}/src/app/app-config.ts`)
        ?.toString('utf-8');
      expect(fileContent).toContain('mailer');
      expect(fileContent).toMatchSnapshot();
    });

    it('should add mailer configuration src/config.ts', async () => {
      const fileContent = tree.read(`./packages/nx-nest/apps/${options.projectName}/src/config.ts`)?.toString('utf-8');
      expect(fileContent).toContain('mailer');
      expect(fileContent).toMatchSnapshot();
    });

    it('should merge the docker-compose.yaml', () => {
      expect(tree.read('docker-compose.yml')?.toString('utf-8')).toMatchSnapshot();
    });
  });
});
