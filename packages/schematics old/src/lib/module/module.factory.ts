import { Path } from '@angular-devkit/core';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { transformOptionsToNestJS, stopExecutionIfNotRunningAtRootFolder } from '../../utils/tree-utils';

export interface IModuleOptions {
  name: string;
  path?: string;
  module?: Path;
  skipImport?: boolean;
  metadata?: string;
  type?: string;
  language?: string;
  sourceRoot?: string;
  flat?: boolean;
}

export function main(options: IModuleOptions): Rule {
  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    transformOptionsToNestJS(options, './', false),
    externalSchematic('@nestjs/schematics', 'module', options),
  ]);
}
