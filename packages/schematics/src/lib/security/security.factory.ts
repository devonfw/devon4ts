import { Path, strings } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { formatTsFile, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

export interface ISecurityInitializer {
  path?: string;
}

function updatePackageJson(project: string | undefined): Rule {
  return (host: Tree): Tree => {
    const filePath = join((project || '.') as Path, 'package.json');

    const content = JSON.parse(host.read(filePath)!.toString('utf-8'));
    content.dependencies[packagesVersion.helmet.packageName] = packagesVersion.helmet.packageVersion;

    host.overwrite(filePath, JSON.stringify(content, null, 2));

    return host;
  };
}

function updateMain(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    const filePath = join((project || '.') as Path, '/src/main.ts');
    const content = new ASTFileBuilder(tree.read(filePath)!.toString('utf-8'))
      .addDefaultImports('helmet', 'helmet')
      .insertLinesToFunctionBefore('bootstrap', 'app.listen', 'app.use(helmet());')
      .insertLinesToFunctionBefore(
        'bootstrap',
        'app.listen',
        // tslint:disable-next-line: quotemark
        "app.enableCors({ origin: '*', credentials: true, exposedHeaders: 'Authorization', allowedHeaders: 'authorization, content-type',});",
      )
      .build();

    if (content) {
      tree.overwrite(filePath, formatTsFile(content));
    }
    return tree;
  };
}

export function security(options: ISecurityInitializer): Rule {
  return (): any => {
    if (!options.path) {
      options.path = '.';
    }
    options.path = strings.dasherize(options.path);
    return chain([updatePackageJson(options.path), updateMain(options.path), installNodePackages()]);
  };
}
