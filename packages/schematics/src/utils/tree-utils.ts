import { join, Path } from '@angular-devkit/core';
import { FileEntry, forEach, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { ModuleFinder } from '@nestjs/schematics/dist/utils/module.finder';
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

export function formatTsFile(content: string): string {
  return format(content, PRETTIER_DEFAULT_OPTS);
}

export function formatTsFiles(): Rule {
  return forEach((fileEntry: FileEntry) => {
    if (
      !fileEntry.path.startsWith('/node_modules') &&
      !fileEntry.path.startsWith('/dist') &&
      fileEntry.path.endsWith('.ts')
    ) {
      return {
        path: fileEntry.path,
        content: Buffer.from(formatTsFile(fileEntry.content.toString())),
      };
    }

    return fileEntry;
  });
}

export function existsConfigModule(tree: Tree, path: string): boolean {
  const core = new ModuleFinder(tree).find({
    name: 'core',
    path: join('.' as Path, path || '.', 'src/app/core') as Path,
  });

  if (!core) {
    return false;
  }

  return !!tree.read(core)?.toString().includes('ConfigModule');
}

export function installNodePackages(): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    context.addTask(new NodePackageInstallTask({ packageManager: 'yarn' }));
    return host;
  };
}
