import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nx/devkit';
import * as path from 'path';
import { EntityGeneratorSchema } from './schema';
import { classify } from '../../utils';
import pluralize from 'pluralize';
import { packagesVersion } from '../packagesVersion';

export async function entityGenerator(tree: Tree, options: EntityGeneratorSchema): Promise<() => void> {
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['typeorm'].name]: packagesVersion['typeorm'].version,
      [packagesVersion['nestjsTypeorm'].name]: packagesVersion['nestjsTypeorm'].version,
      [packagesVersion['mysql2'].name]: packagesVersion['mysql2'].version,
    },
    {},
  );
  const projectRoot = `apps/${options.projectName}/src/app/${pluralize(options.name)}`;
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    classify,
    ...options,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree, false, '', 'pnpm');
  };
}

export default entityGenerator;
