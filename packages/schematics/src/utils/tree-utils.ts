import { Tree } from '@nx/devkit';

export function runningAtRootFolder(tree: Tree): boolean {
  return ['/package.json', '/nx.json', '/tsconfig.json'].map(file => tree.exists(file)).every(exists => exists);
}

export function stopExecutionIfNotRunningAtRootFolder(tree: Tree): Tree {
  if (!runningAtRootFolder(tree)) {
    throw new Error('You must run the schematic at your Nx worspace root folder.');
  }
  return tree;
}

export function existsConvictConfig(tree: Tree, projectName: string): boolean {
  return tree.exists(`apps/${projectName}/src/config.ts`);
}
