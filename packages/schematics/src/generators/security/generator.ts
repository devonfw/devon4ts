import { addDependenciesToPackageJson, formatFiles, installPackagesTask, Tree } from '@nx/devkit';
import { SecurityGeneratorSchema } from './schema';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

export async function securityGenerator(tree: Tree, options: SecurityGeneratorSchema): Promise<() => void> {
  addDependenciesToPackageJson(tree, { helmet: 'latest' }, {});
  const projectRoot = `apps/${options.projectName}/src/main.ts`;
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
    installPackagesTask(tree, false, '', 'pnpm');
  };
}

export default securityGenerator;
