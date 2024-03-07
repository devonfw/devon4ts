import { Tree, generateFiles } from '@nx/devkit';
import { dirname, join } from 'path';
import { ASTFileBuilder } from '../ast-file-builder';

export function ensureConfigFile(tree: Tree, projectRoot: string, npmScope: string): void {
  const baseConfigPath = join(projectRoot, 'src/app/app-config.ts');
  const configPath = join(projectRoot, 'src/config.ts');

  if (!tree.exists(configPath)) {
    return;
  }

  updateMain(tree, projectRoot, npmScope);
  if (tree.exists(baseConfigPath)) {
    return;
  }

  generateFiles(tree, join(__dirname, 'files'), dirname(baseConfigPath), { npmScope });
  let configFile = tree.read(configPath)?.toString('utf-8') ?? '';
  configFile = new ASTFileBuilder(configFile)
    .updateDefaultExportParamAsType('config', 'Schema<AppConfig>')
    .removeImport('BaseConfig', `@${npmScope}/shared/config`)
    .addImports('AppConfig', './app/app-config')
    .build();

  tree.write(configPath, configFile);
}

function updateMain(tree: Tree, projectRoot: string, npmScope: string): void {
  const mainPath = join(projectRoot, 'src/main.ts');
  let mainContent = tree.read(mainPath)?.toString('utf-8');

  if (!mainContent || mainContent.includes('const config: AppConfig')) {
    return;
  }

  mainContent = mainContent.replace('const config: BaseConfig', 'const config: AppConfig');
  mainContent = new ASTFileBuilder(mainContent)
    .removeImport('BaseConfig', `@${npmScope}/shared/config`)
    .addImports('AppConfig', './app/app-config')
    .build();

  tree.write(mainPath, mainContent);
}
