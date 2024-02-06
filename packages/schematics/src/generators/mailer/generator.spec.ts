import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { mailerGenerator } from './generator';
import { MailerGeneratorSchema } from './schema';

describe('mailer generator', () => {
  let tree: Tree;
  const options: MailerGeneratorSchema = { projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await mailerGenerator(tree, options);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"typeorm":/g);
  });

  it('should add MailerModule to core.module', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8');
    expect(fileContent).toContain('MailerModule');
  });
});
