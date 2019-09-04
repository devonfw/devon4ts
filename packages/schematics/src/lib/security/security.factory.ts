import { Path } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { join } from 'path';
import { packagesVersion } from '../packagesVersion';
import {
  addDefaultImports,
  insertLinesToFunctionBefore,
} from '../../utils/ast-utils';

export interface ISecurityInitializer {
  path?: string;
}

export function security(options: ISecurityInitializer): Rule {
  return chain([updatePackageJson(options.path), updateMain(options.path)]);
}

function updatePackageJson(project: string | undefined) {
  return (host: Tree) => {
    const filePath = join((project || '.') as Path, 'package.json');

    const content = JSON.parse(host.read(filePath)!.toString('utf-8'));
    content.dependencies.helmet = packagesVersion.helmet;
    content.devDependencies['@types/helmet'] = packagesVersion.typesHelmet;

    host.overwrite(filePath, JSON.stringify(content, null, 2));

    return host;
  };
}

function updateMain(project: string | undefined): Rule {
  return (tree: Tree): Tree => {
    const filePath = join((project || '.') as Path, '/src/main.ts');
    let content = tree.read(filePath)!.toString('utf-8');

    content = addDefaultImports(content, 'helmet', 'helmet');
    content = insertLinesToFunctionBefore(
      content,
      'bootstrap',
      'app.listen',
      'app.use(helmet());',
    );
    content = insertLinesToFunctionBefore(
      content,
      'bootstrap',
      'app.listen',
      // tslint:disable-next-line: quotemark
      "app.enableCors({ origin: '*', credentials: true, exposedHeaders: 'Authorization', allowedHeaders: 'authorization, content-type',});",
    );

    if (content) {
      tree.overwrite(filePath, content);
    }
    return tree;
  };
}
