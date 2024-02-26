import {
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { existsConvictConfig } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import {
  defaultSwaggerConfig,
  defaultSwaggerConfigType,
  swaggerTemplate,
  swaggerTemplateWithConfig,
} from './configvalue';
import { SwaggerGeneratorSchema } from './schema';

export async function swaggerGenerator(tree: Tree, options: SwaggerGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(
    tree,
    { [packagesVersion['nestjsSwagger'].name]: packagesVersion['nestjsSwagger'].version },
    {},
  );
  const projectRoot = appConfig.sourceRoot ?? 'src/';
  addSwaggerToMain(tree, projectRoot);
  updateBaseEntity(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default swaggerGenerator;

function addSwaggerToMain(tree: Tree, projectRoot: string): void {
  const mainPath = path.join(projectRoot, 'main.ts');

  const content = new ASTFileBuilder(tree.read(mainPath)!.toString('utf-8'))
    .addImports('DocumentBuilder', '@nestjs/swagger')
    .addImports('SwaggerModule', '@nestjs/swagger');
  if (existsConvictConfig(tree, projectRoot)) {
    updateConfigTypeFile(tree, projectRoot);
    updateConfigFile(tree, projectRoot);
    content
      .addDefaultImports('config', 'config')
      .insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplateWithConfig);
  } else {
    content.insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplate);
  }

  if (content) {
    tree.write(mainPath, content.build());
  }
}

function updateConfigFile(tree: Tree, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'config.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addPropertyToObjectLiteralParam('config', 0, 'swagger', defaultSwaggerConfig)
    .build();

  tree.write(typesFile, typesFileContent);
}

function updateConfigTypeFile(tree: Tree, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'app/shared/app-config.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addPropToInterface('AppConfig', 'swagger', defaultSwaggerConfigType)
    .build();

  tree.write(typesFile, typesFileContent);
}

function updateBaseEntity(tree: Tree, projectRoot: string): void {
  const baseEntityPath = path.join(projectRoot, 'app/shared/model/entities/base.entity.ts');

  if (!tree.exists(baseEntityPath)) {
    return;
  }

  const fileContent = new ASTFileBuilder(tree.read(baseEntityPath)!.toString('utf-8'))
    .addImports('ApiHideProperty', '@nestjs/swagger')
    .addDecoratorToClassProp('BaseEntity', 'version', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ])
    .addDecoratorToClassProp('BaseEntity', 'createdAt', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ])
    .addDecoratorToClassProp('BaseEntity', 'updatedAt', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ])
    .build();

  if (fileContent) {
    tree.write(baseEntityPath, fileContent);
  }
}
