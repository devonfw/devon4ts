import { addProjectConfiguration, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { Devon4tsNodeApplicationGeneratorSchema } from './schema';

export async function devon4tsNodeApplicationGenerator(tree: Tree, options: Devon4tsNodeApplicationGeneratorSchema) {
  const projectRoot = `libs/${options.name}`;
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'library',
    sourceRoot: `${projectRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

export default devon4tsNodeApplicationGenerator;
