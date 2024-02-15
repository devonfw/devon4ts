import { addDependenciesToPackageJson, formatFiles, generateFiles, installPackagesTask, Tree } from '@nx/devkit';
import * as path from 'path';
import { EntityGeneratorSchema } from './schema';
import { classify } from '../../utils';
import pluralize from 'pluralize';

export async function entityGenerator(tree: Tree, options: EntityGeneratorSchema): Promise<() => void> {
  addDependenciesToPackageJson(tree, { 'typeorm': 'latest', '@nestjs/typeorm': 'latest', 'mysql2': 'latest' }, {});
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
