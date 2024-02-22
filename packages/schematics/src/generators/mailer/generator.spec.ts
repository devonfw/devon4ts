import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from '../application/generator';
import { mailerGenerator } from './generator';
import { MailerGeneratorSchema } from './schema';

describe('mailer generator', () => {
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
    jest.clearAllMocks();
  }, 60000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"handlebars":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@devon4ts_node\/mailer":/g);
  });

  it('should add MailerModule to core.module', async () => {
    const fileContent = tree
      .read(`./packages/schematics/apps/${options.projectName}/src/app/core/core.module.ts`)
      ?.toString('utf-8');

    expect(fileContent).toContain('MailerModule');
  });
});
