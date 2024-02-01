import { formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ServiceGeneratorSchema } from './schema';

export async function serviceGenerator(tree: Tree, options: ServiceGeneratorSchema): Promise<void> {
  function classify(val: string): string {
    return val.charAt(0).toUpperCase() + val.slice(1);
  }
  const projectRoot = `apps/${options.project}/src/app/${options.name}`;
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    classify,
    ...options,
  });
  await formatFiles(tree);
}

export default serviceGenerator;
