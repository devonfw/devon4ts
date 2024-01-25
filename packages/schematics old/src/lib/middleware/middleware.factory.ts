import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import {
  BaseNestOptions,
  transformOptionsToNestJS,
  stopExecutionIfNotRunningAtRootFolder,
} from '../../utils/tree-utils';

export function main(options: BaseNestOptions): Rule {
  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    transformOptionsToNestJS(options, './'),
    externalSchematic('@nestjs/schematics', 'middleware', options),
  ]);
}
