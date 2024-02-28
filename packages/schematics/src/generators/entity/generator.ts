import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { plural } from 'pluralize';
import { classify } from '../../utils';
import { packagesVersion } from '../packagesVersion';
import { EntityGeneratorSchema } from './schema';

export async function entityGenerator(tree: Tree, options: EntityGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(
    tree,
    {
      [packagesVersion['typeorm'].name]: packagesVersion['typeorm'].version,
      [packagesVersion['nestjsTypeorm'].name]: packagesVersion['nestjsTypeorm'].version,
    },
    {},
  );
  const projectRoot = `${appConfig.root}/src/app/${plural(options.name)}/entities`;
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    classify,
    ...options,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default entityGenerator;
