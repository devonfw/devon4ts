import { addDependenciesToPackageJson, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ControllerGeneratorSchema } from './schema';
import { classify } from '../../utils';

export async function controllerGenerator(tree: Tree, options: ControllerGeneratorSchema): Promise<void> {
  const projectRoot = `apps/${options.project}/src/app/${options.name}`;
  if (tree.exists(`${projectRoot}/${options.name}.controller.ts`)) {
    throw new Error(`The controller "${options.name}" already exists.`);
  }
  addDependenciesToPackageJson(tree, { '@nestjs/common': 'latest' }, { '@nestjs/testing': 'latest' });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    classify,
    ...options,
  });
  let modulePath = `${projectRoot}/${options.name}.module.ts`;
  const controllerName = classify(options.name) + 'Controller';
  let controllerPath = `./${options.name}.controller`;
  if (!tree.exists(modulePath)) {
    modulePath = `apps/${options.project}/src/app/app.module.ts`;
    controllerPath = `./${options.name}/${options.name}.controller`;
  }
  let moduleFile = tree.read(modulePath)!.toString('utf-8');

  // Add imports
  moduleFile = moduleFile.replace('import', `import { ${controllerName} } from '${controllerPath}'; import`);
  // Modify Module decorator
  moduleFile = moduleFile.replace('controllers: [', `controllers: [ ${controllerName},`);
  tree.write(modulePath, moduleFile);
  await formatFiles(tree);
}

export default controllerGenerator;
