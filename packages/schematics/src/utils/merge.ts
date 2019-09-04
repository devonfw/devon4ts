import { basename } from 'path';
import { safeDump, safeLoad } from 'js-yaml';
import { defaultsDeep } from 'lodash';
import { Tree, FileEntry } from '@angular-devkit/schematics';

export function mergeDockerFiles(tree: Tree) {
  return (fileEntry: FileEntry) => {
    if (tree.exists(fileEntry.path)) {
      if (basename(fileEntry.path) === 'docker-compose.yml') {
        tree.overwrite(
          fileEntry.path,
          safeDump(
            defaultsDeep(
              safeLoad(fileEntry.content.toString('utf-8')),
              safeLoad(tree.read(fileEntry.path)!.toString('utf-8')),
            ),
          ),
        );
      }

      // Do not add the new file if it already exists
      return null;
    }
    return fileEntry;
  };
}
