import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { mailerGenerator } from './generator';
import { MailerGeneratorSchema } from './schema';
import applicationGenerator from './generator';

describe('mailer generator', () => {
  let tree: Tree;
  const options: MailerGeneratorSchema = { projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    await mailerGenerator(tree, options);
    jest.clearAllMocks();
  }, 15000);

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"handlebars\":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@devon4ts_node\/mailer\":/g);
  });

  it('should add MailerModule to core.module', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8');
    if (fileContent) {
      expect(fileContent).toContain('MailerModule');
    } else {
      expect(fileContent).toBeUndefined();
    }
  });
});
