import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  readProjectConfiguration,
  Tree,
} from '@nx/devkit';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { packagesVersion } from '../packagesVersion';
import { SecurityGeneratorSchema } from './schema';

export async function securityGenerator(tree: Tree, options: SecurityGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  addDependenciesToPackageJson(tree, { [packagesVersion['helmet'].name]: packagesVersion['helmet'].version }, {});
  const projectRoot = `${appConfig.sourceRoot ?? 'src'}/main.ts`;
  const content = new ASTFileBuilder(tree.read(projectRoot)!.toString('utf-8'))
    .addDefaultImports('helmet', 'helmet')
    .insertLinesToFunctionBefore('bootstrap', 'app.listen', 'app.use(helmet());')
    .insertLinesToFunctionBefore(
      'bootstrap',
      'app.listen',
      `app.enableCors({ origin: '*', credentials: true, exposedHeaders: 'Authorization', allowedHeaders: 'authorization, content-type',});`,
    )
    .build();

  if (content) {
    tree.write(projectRoot, content);
  }
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default securityGenerator;
