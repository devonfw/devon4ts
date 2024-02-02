import { addDependenciesToPackageJson, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { ServiceGeneratorSchema } from './schema';
import { classify } from '../../utils';

export async function serviceGenerator(tree: Tree, options: ServiceGeneratorSchema): Promise<void> {
  const projectRoot = `apps/${options.project}/src/app/${options.name}`;
  if (tree.exists(`${projectRoot}/${options.name}.service.ts`)) {
    throw new Error(`The service "${options.name}" already exists.`);
  }
  addDependenciesToPackageJson(tree, { '@nestjs/common': 'latest' }, { '@nestjs/testing': 'latest' });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    classify,
    ...options,
  });
  let modulePath = `${projectRoot}/${options.name}.module.ts`;
  const serviceName = classify(options.name) + 'Service';
  let servicePath = `./${options.name}.service`;
  if (!tree.exists(modulePath)) {
    modulePath = `apps/${options.project}/src/app/app.module.ts`;
    servicePath = `./dogs/${options.name}.service`;
  }
  let moduleFile = tree.read(modulePath)!.toString('utf-8');

  // Add imports
  moduleFile = moduleFile.replace('import', `import { ${serviceName} } from '${servicePath}'; import`);
  // Modify Module decorator
  moduleFile = moduleFile.replace('providers: [', `providers: [ ${serviceName},`);
  tree.write(modulePath, moduleFile);
  await formatFiles(tree);
}

export default serviceGenerator;
