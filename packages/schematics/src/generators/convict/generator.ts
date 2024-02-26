import {
  addDependenciesToPackageJson,
  formatFiles,
  generateFiles,
  installPackagesTask,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import * as path from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { packagesVersion } from '../packagesVersion';
import { ConvictGeneratorSchema } from './schema';

export async function convictGenerator(tree: Tree, options: ConvictGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(
    tree,
    { [packagesVersion['convict'].name]: packagesVersion['convict'].version },
    { [packagesVersion['typesConvict'].name]: packagesVersion['typesConvict'].version },
  );
  const projectRoot = appConfig.sourceRoot ?? 'src/';
  addConvictToMain(tree, projectRoot);
  updateLogger(tree, projectRoot);
  addConfigToCoreModule(tree, projectRoot);
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, options);
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default convictGenerator;

function addConvictToMain(tree: Tree, projectRoot: string): void {
  const mainPath = path.join(projectRoot, 'main.ts');
  let content = tree.read(mainPath)?.toString('utf-8');

  if (!content) {
    return;
  }

  content = content.replace('await app.listen(3000);', 'await app.listen(config.port);');
  content = content.replace("defaultVersion: '1',", 'defaultVersion: config.defaultVersion,');
  content = new ASTFileBuilder(content).addDefaultImports('config', './config').build();

  if (content) {
    tree.write(mainPath, content);
  }
}

function updateLogger(tree: Tree, projectRoot: string): void {
  const loggerPath = path.join(projectRoot, 'app/shared/logger/winston.logger.ts');
  let content = tree.read(loggerPath)?.toString('utf-8');

  if (!content) {
    return;
  }

  content = content.replace(/oneLineStack\(\w*\),/g, 'oneLineStack(config.logger.oneLineStack),');
  content = content.replace(/colorize\(\w*\),/g, 'colorize(config.logger.color),');
  content = content.replace(/level:.*,/g, 'level: config.logger.loggerLevel,');

  content = new ASTFileBuilder(content).addDefaultImports('config', '../../../config').build();

  if (content) {
    tree.write(loggerPath, content);
  }
}

function addConfigToCoreModule(tree: Tree, projectRoot: string): void {
  const module = path.join(projectRoot, '/app/core/core.module.ts');
  if (!tree.exists(module)) {
    return;
  }

  let fileContent: ASTFileBuilder | undefined = new ASTFileBuilder(tree.read(module)!.toString('utf-8'));

  if (fileContent.build().includes('provide: CONFIG_PROVIDER')) {
    return;
  }

  fileContent = fileContent
    .addImports('CONFIG_PROVIDER', '../shared/dependency-injection.constants')
    .addDefaultImports('config', '../../config')
    .addToModuleDecorator(
      'CoreModule',
      `{
          provide: CONFIG_PROVIDER,
          useValue: config,
        }`,
      'providers',
    );

  fileContent?.addToModuleDecorator('CoreModule', 'CONFIG_PROVIDER', 'exports');

  if (fileContent) {
    tree.write(module, fileContent.build());
  }
}
