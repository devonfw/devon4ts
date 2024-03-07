import {
  formatFiles,
  generateFiles,
  installPackagesTask,
  names,
  output,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { findModuleFile } from '../../utils/tree-utils';
import { EntityGeneratorSchema } from './schema';

export async function entityGenerator(tree: Tree, options: EntityGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  const projectRoot = `${appConfig.root}/src/${appConfig.projectType === 'application' ? 'app' : 'lib'}`;
  const entityNames = names(options.name);

  const entityPath: string = options.module ?? '.';

  if (options.module && !tree.exists(path.join(projectRoot, entityPath, options.module + '.module.ts'))) {
    throw Error('wrong module');
  }

  generateFiles(tree, path.join(__dirname, 'files'), path.join(projectRoot, entityPath), {
    name: entityNames.fileName,
    className: entityNames.className,
  });
  addEntityToModule(tree, path.join(projectRoot, entityPath), options.name);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
    output.log({
      title: `Entity ${entityNames.className} created.`,
      bodyLines: [
        'Please update your DataSource configuration by adding the entity into entities array',
        'You can find it at CoreModule',
      ],
    });
  };
}

function addEntityToModule(tree: Tree, modulePath: string, entityName: string): void {
  const moduleFile = findModuleFile(tree, modulePath);

  if (!moduleFile) {
    return;
  }

  const contentBuilder = new ASTFileBuilder(tree.read(path.join(modulePath, moduleFile))!.toString());
  const moduleName = contentBuilder.getModuleClassName();
  const entityNames = names(entityName);

  if (!moduleName) {
    return;
  }

  contentBuilder
    .addImports(entityNames.className, './' + entityNames.fileName + '.entity')
    .addImports('TypeOrmModule', '@nestjs/typeorm')
    .addTypeormFeatureToModule(moduleName, entityNames.className);

  tree.write(path.join(modulePath, moduleFile), contentBuilder.build());
}

export default entityGenerator;
