import { Tree } from '@angular-devkit/schematics';
import { join, Path } from '@angular-devkit/core';

export function addBarrels(
  tree: Tree,
  path: string,
  barrels: string | string[],
): Tree {
  const exportSentence = 'export * from ';
  const indexPath = join(path as Path, 'index.ts');

  if (!tree.exists(indexPath)) {
    tree.create(indexPath, '');
  }

  let content = tree.read(indexPath)!.toString();
  let barrelSet: Set<string>;

  if (typeof barrels === 'string') {
    barrelSet = new Set();
    barrelSet.add(barrels);
  } else {
    barrelSet = new Set(barrels);
  }

  barrelSet.forEach(elem => {
    if (!content.includes(elem)) {
      // prettier-ignore
      content +=
        exportSentence
          .concat('\'./')
          .concat(elem.replace('.ts', ''))
          .concat('\';\n');
    }
  });

  tree.overwrite(indexPath, content);

  return tree;
}
