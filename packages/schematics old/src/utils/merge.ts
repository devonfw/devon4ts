import { extname } from '@angular-devkit/core';
import { FileEntry, forEach, Tree, Rule } from '@angular-devkit/schematics';
import { dump, load } from 'js-yaml';
import { cloneDeep, defaultsDeep, isPlainObject } from 'lodash';
import { basename } from 'path';

function assignDeep(target: any, ...args: any[]): any {
  const newTarget = cloneDeep(target);
  args.forEach(arg => {
    const properties: any[][] = [[newTarget, arg]];

    while (properties.length > 0) {
      const [base, source] = properties.shift()!;

      Object.keys(source).forEach(key => {
        if (isPlainObject(source[key]) && base[key] !== undefined) {
          properties.push([base[key], source[key]]);
        } else {
          base[key] = source[key];
        }
      });
    }
  });

  return newTarget;
}

export function mergeJsonFile(tree: Tree, fileEntry: FileEntry): FileEntry | null {
  if (tree.exists(fileEntry.path)) {
    if (extname(fileEntry.path) === '.json' || basename(fileEntry.path) === '.prettierrc') {
      tree.overwrite(
        fileEntry.path,
        JSON.stringify(
          assignDeep(
            JSON.parse(tree.read(fileEntry.path)!.toString('utf-8')),
            JSON.parse(fileEntry.content.toString('utf-8')),
          ),
          null,
          2,
        ),
      );
    }

    // Do not add the new file if it already exists
    return null;
  }
  return fileEntry;
}

export function mergeYmlFile(tree: Tree, fileEntry: FileEntry): FileEntry | null {
  if (tree.exists(fileEntry.path)) {
    if (extname(fileEntry.path) === '.yml' || extname(fileEntry.path) === '.yaml') {
      tree.overwrite(
        fileEntry.path,
        dump(
          defaultsDeep(load(fileEntry.content.toString('utf-8')), load(tree.read(fileEntry.path)!.toString('utf-8'))),
        ),
      );
    }

    // Do not add the new file if it already exists
    return null;
  }
  return fileEntry;
}

export function mergeFiles(tree: Tree): Rule {
  return forEach((fileEntry: FileEntry) => {
    const extension = extname(fileEntry.path);
    const fileName = basename(fileEntry.path);

    if (extension === '.json' || fileName === '.prettierrc') {
      return mergeJsonFile(tree, fileEntry);
    }

    if (extension === '.yml') {
      return mergeYmlFile(tree, fileEntry);
    }

    return fileEntry;
  });
}
