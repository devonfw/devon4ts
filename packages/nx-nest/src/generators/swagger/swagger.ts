import {
  Tree,
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  readProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { ensureConfigFile } from '../../utils/config/config-defaults';
import { ensureProjectIsAnApplication, existsConvictConfig, getNpmScope } from '../../utils/tree-utils';
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

  ensureProjectIsAnApplication(appConfig);

  addDependenciesToPackageJson(
    tree,
    { [packagesVersion['nestjsSwagger'].name]: packagesVersion['nestjsSwagger'].version },
    {},
  );
  const projectRoot = appConfig.sourceRoot ?? 'src/';
  const existsConvict = existsConvictConfig(tree, projectRoot);
  addSwaggerToMain(tree, projectRoot, existsConvict);
  updateWebpack(tree, path.join(projectRoot, '..'));
  if (existsConvict) {
    ensureConfigFile(tree, appConfig.root, getNpmScope(tree));
    updateConfigTypeFile(tree, appConfig.root);
    updateConfigFile(tree, appConfig.root);
  }
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default swaggerGenerator;

function addSwaggerToMain(tree: Tree, projectRoot: string, existsConvict: boolean): void {
  const mainPath = path.join(projectRoot, 'main.ts');

  const content = new ASTFileBuilder(tree.read(mainPath)!.toString('utf-8'))
    .addImports('DocumentBuilder', '@nestjs/swagger')
    .addImports('SwaggerModule', '@nestjs/swagger');
  if (existsConvict) {
    content.insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplateWithConfig);
  } else {
    content.insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplate);
  }

  if (content) {
    tree.write(mainPath, content.build());
  }
}

function updateConfigFile(tree: Tree, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'src/config.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addPropertyToDefaultExportObjectLiteralParam(0, 'swagger', defaultSwaggerConfig)
    .build();

  tree.write(typesFile, typesFileContent);
}

function updateConfigTypeFile(tree: Tree, projectRoot: string): void {
  const typesFile = path.join(projectRoot, 'src/app/app-config.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addPropToInterface('AppConfig', 'swagger', defaultSwaggerConfigType)
    .build();

  tree.write(typesFile, typesFileContent);
}

function updateWebpack(tree: Tree, projectRoot: string): void {
  const webpackFile = path.join(projectRoot, 'webpack.config.js');

  let webpackFileContent = tree.read(webpackFile)!.toString('utf-8');
  webpackFileContent = webpackFileContent.replace(
    `target: 'node',`,
    `target: 'node',
      transformers: [
        {
          name: '@nestjs/swagger/plugin',
          options: {
            introspectComments: true,
          },
        },
      ],`,
  );

  tree.write(webpackFile, webpackFileContent);
}
