import { GeneratorCallback, Tree } from '@nx/devkit';
import type { Linter } from '@nx/eslint';
import { join } from 'path';
import devon4tsApplicationGenerator from '../application/application';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema): Promise<GeneratorCallback> {
  const tasks = await devon4tsApplicationGenerator(tree, {
    name: options.name,
    directory: join('apps', options.name),
    projectNameAndRootFormat: 'as-provided',
    linter: 'eslint' as Linter,
    e2eTestRunner: 'jest',
    strict: true,
    unitTestRunner: 'jest',
  });
  return tasks;
}

export default presetGenerator;
