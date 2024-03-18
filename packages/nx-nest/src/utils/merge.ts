import { Tree } from '@nx/devkit';
import { dump, load } from 'js-yaml';
import { defaultsDeep } from 'lodash';

export function mergeYmlFile(content1: string, content2: string): string {
  return dump(defaultsDeep(load(content1), load(content2)));
}

export function mergeDockerCompose(tree: Tree, content: string): void {
  const dockerComposePath = 'compose.yaml';
  const dockerComposeYml = tree.read(dockerComposePath)?.toString('utf-8') ?? '';

  tree.write(dockerComposePath, mergeYmlFile(dockerComposeYml, content));
}
