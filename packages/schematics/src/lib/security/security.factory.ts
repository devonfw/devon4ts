import { Path } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { formatTsFile, installNodePackages, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

function updatePackageJson(): Rule {
  return (host: Tree): Tree => {
    const filePath = 'package.json' as Path;

    const content = JSON.parse(host.read(filePath)!.toString('utf-8'));
    content.dependencies[packagesVersion.helmet.packageName] = packagesVersion.helmet.packageVersion;

    host.overwrite(filePath, JSON.stringify(content, null, 2));

    return host;
  };
}

function updateMain(): Rule {
  return (tree: Tree): Tree => {
    const filePath = '/src/main.ts' as Path;
    const content = new ASTFileBuilder(tree.read(filePath)!.toString('utf-8'))
      .addDefaultImports('helmet', 'helmet')
      .insertLinesToFunctionBefore('bootstrap', 'app.listen', 'app.use(helmet());')
      .insertLinesToFunctionBefore(
        'bootstrap',
        'app.listen',
        `app.enableCors({ origin: '*', credentials: true, exposedHeaders: 'Authorization', allowedHeaders: 'authorization, content-type',});`,
      )
      .build();

    if (content) {
      tree.overwrite(filePath, formatTsFile(content));
    }
    return tree;
  };
}

export function security(): Rule {
  return chain([stopExecutionIfNotRunningAtRootFolder(), updatePackageJson(), updateMain(), installNodePackages()]);
}
