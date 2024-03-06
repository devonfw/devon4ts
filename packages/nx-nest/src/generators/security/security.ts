import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  installPackagesTask,
  readProjectConfiguration,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { packagesVersion } from '../packagesVersion';
import { SecurityGeneratorSchema } from './schema';

export async function securityGenerator(tree: Tree, options: SecurityGeneratorSchema): Promise<GeneratorCallback> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  const mainPath = `${appConfig.sourceRoot ?? 'src'}/main.ts`;
  const tasks = addDependenciesToPackageJson(
    tree,
    { [packagesVersion['helmet'].name]: packagesVersion['helmet'].version },
    {},
  );
  updateMain(tree, mainPath);
  await formatFiles(tree);

  return runTasksInSerial(
    ...[
      tasks,
      (): void => {
        installPackagesTask(tree);
      },
    ],
  );
}

export default securityGenerator;

function updateMain(tree: Tree, mainPath: string): void {
  const content = new ASTFileBuilder(tree.read(mainPath)!.toString('utf-8'))
    .addDefaultImports('helmet', 'helmet')
    .insertLinesToFunctionAfter('bootstrap', 'const port = ', 'app.use(helmet());')
    .insertLinesToFunctionAfter(
      'bootstrap',
      'const port = ',
      `app.enableCors({ origin: '*', credentials: true, exposedHeaders: 'Authorization', allowedHeaders: 'authorization, content-type',});`,
    )
    .build();

  if (content) {
    tree.write(mainPath, content);
  }
}
