import { Tree, FileEntry, forEach, Rule } from '@angular-devkit/schematics';
import { join, Path } from '@angular-devkit/core';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import { basename } from 'path';
import { format, Options } from 'prettier';

const PRETTIER_DEFAULT_OPTS: Options = {
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  printWidth: 120,
  tabWidth: 2,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  quoteProps: 'consistent',
  useTabs: false,
  parser: 'typescript',
};

export function addBarrels(tree: Tree, path: string, barrels: string | string[]): Tree {
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

export function formatTsFiles(): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (fileEntry.path.endsWith('.ts')) {
      return {
        path: fileEntry.path,
        content: Buffer.from(formatTsFile(fileEntry.content.toString())),
      };
    }

    return fileEntry;
  });
}

export function formatTsFile(content: string) {
  return format(content, PRETTIER_DEFAULT_OPTS);
}

export function existsConfigModule(tree: Tree, path: string): boolean {
  const config = new ModuleFinder(tree).find({
    name: 'configuration',
    path: join('.' as Path, path || '.', 'src/app/core/configuration') as Path,
  });

  return !!config && basename(config) === 'configuration.module.ts';
}
