import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { convictGenerator } from './generator';
import { ConvictGeneratorSchema } from './schema';

describe('convict generator', () => {
  let tree: Tree;
  const options: ConvictGeneratorSchema = { projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await convictGenerator(tree, options);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"convict":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"@types\/convict":/g);
  });

  it('should add convict configuration to main.ts', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
    expect(fileContent).toContain("import config from 'config'");
    expect(fileContent).toContain('await app.listen(config.port);');
  });

  it('should update winston configuration', async () => {
    const filePath = `./apps/${options.projectName}/src/app/shared/logger/winston.logger.ts`;
    if (tree.exists(filePath)) {
      const fileContent = tree.read(filePath)?.toString('utf-8');
      expect(fileContent).toContain('level: config.logger.loggerLevel');
    } else {
      expect(tree.exists(filePath)).toBeFalsy();
    }
  });
});
