import { Tree, readJson } from '@nx/devkit';
import { join } from 'path';

export function existsConvictConfig(tree: Tree, projectRoot: string): boolean {
  if (projectRoot.endsWith('/src')) {
    return tree.exists(`${projectRoot}/config.ts`);
  }
  return tree.exists(`${projectRoot}/src/config.ts`);
}

export function getNpmScope(tree: Tree): string {
  const { name } = tree.exists('package.json') ? readJson<{ name?: string }>(tree, 'package.json') : { name: null };

  return name?.startsWith('@') ? name.split('/')[0].substring(1) : '';
}

export function updateJestConfig(tree: Tree, projectRoot: string): void {
  const jestconfigPath = join(projectRoot, 'jest.config.ts');
  let jestconfig = tree.read(jestconfigPath)?.toString('utf-8');

  if (!jestconfig || jestconfig.includes('passWithNoTests: true')) {
    return;
  }

  jestconfig = jestconfig.replace(`testEnvironment: 'node',`, `testEnvironment: 'node',\npassWithNoTests: true,`);
  tree.write(jestconfigPath, jestconfig);
}

export function findModuleFile(tree: Tree, modulePath: string): string | undefined {
  return tree.children(modulePath).find(m => m.endsWith('.module.ts'));
}
