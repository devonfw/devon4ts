import { formatFiles, generateFiles, Tree, updateJson } from '@nx/devkit';
import * as path from 'path';
import { SwaggerGeneratorSchema } from './schema';

export async function serviceGenerator(tree: Tree, options: SwaggerGeneratorSchema): Promise<void> {
  updateJson(tree, 'package.json', pkgJson => {
    // if scripts is undefined, set it to an empty object
    pkgJson.dependencies = pkgJson.dependencies ?? {};
    // add greet script
    pkgJson.dependencies.push({ '@nestjs/swagger': '' });
    // return modified JSON object
    return pkgJson;
  });
  const packageJsonRoot = 'package.json';
  const projectRoot = `apps/${options.project}/src`;
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
}

function updatePackageJson(): void {}

export default serviceGenerator;
