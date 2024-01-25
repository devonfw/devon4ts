import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import {
  BaseNestOptions,
  stopExecutionIfNotRunningAtRootFolder,
  transformOptionsToNestJS,
} from '../../utils/tree-utils';

export function main(options: BaseNestOptions): Rule {
  return chain([
    stopExecutionIfNotRunningAtRootFolder(),
    transformOptionsToNestJS(options, 'interceptors'),
    externalSchematic('@nestjs/schematics', 'interceptor', options),
  ]);
}
