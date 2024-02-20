import { Tree, readProjectConfiguration } from '@nx/devkit';
import { ApplicationGeneratorSchema } from './schema';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import applicationGenerator from './generator';

describe('application generator', () => {
  let tree: Tree;
  const options: ApplicationGeneratorSchema = { projectName: 'test' };

  beforeAll(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await applicationGenerator(tree, options);
    const config = readProjectConfiguration(tree, options.projectName);
    expect(config).toBeDefined();
  });

  it('should generate main.ts and other application specific files', async () => {
    expect(tree.exists(`apps/${options.projectName}/src/main.ts`)).toBeTruthy();
    expect(tree.exists(`apps/${options.projectName}/src/app/app.module.ts`)).toBeTruthy();
    expect(tree.exists(`apps/${options.projectName}/src/app/app.controller.ts`)).toBeTruthy();
    expect(tree.exists(`apps/${options.projectName}/src/app/app.service.ts`)).toBeTruthy();
    expect(tree.exists(`apps/${options.projectName}/src/app/app.controller.spec.ts`)).toBeTruthy();
    expect(tree.exists(`apps/${options.projectName}/src/app/app.service.spec.ts`)).toBeTruthy();
  });

  // it('should add dependencies to package.json', async () => {
  //   const fileContent = tree.read('package.json')?.toString('utf-8');
  //   expect(fileContent).toMatch(/"devDependencies": {(.|\n)*"husky":/g);
  //   expect(fileContent).toMatch(/"dependencies": {(.|\n)*"winston":/g);
  // });

  // it('should delete .eslintrc.json and create .eslintrc.js', async () => {
  //   expect(tree.exists(`./apps/${options.projectName}/.eslintrc.json`)).toBeFalsy();
  //   expect(tree.exists(`./apps/${options.projectName}/.eslintrc.js`)).toBeTruthy();
  // });

  // it('should update tsconfig.json', async () => {
  //   expect(tree.exists(`./apps/${options.projectName}/tsconfig.json`)).toBeTruthy();
  //   const fileContent = readJsonFile('package.json');
  //   expect(fileContent.compilerOptions).toEqual({
  //     strictNullChecks: true,
  //     noImplicitAny: true,
  //     strictBindCallApply: true,
  //     forceConsistentCasingInFileNames: true,
  //     noFallthroughCasesInSwitch: true,
  //     strict: true,
  //     skipDefaultLibCheck: true,
  //     noUnusedLocals: true,
  //     noUnusedParameters: true,
  //     skipLibCheck: true,
  //     allowSyntheticDefaultImports: true,
  //   });
  // });

  // it('should generate core module and shared files', async () => {
  //   expect(tree.exists(`./apps/${options.projectName}/.prettierrc`)).toBeTruthy();
  //   expect(tree.exists(`./apps/${options.projectName}/src/app/core/core.module.ts`)).toBeTruthy();
  //   expect(
  //     tree.exists(`./apps/${options.projectName}/src/app/shared/exceptions/entity-not-found.exception.ts`),
  //   ).toBeTruthy();
  //   expect(tree.exists(`./apps/${options.projectName}/src/app/shared/filters/entity-not-found.filter.ts`)).toBeTruthy();
  //   expect(tree.exists(`./apps/${options.projectName}/src/app/shared/logger/winston.logger.ts`)).toBeTruthy();
  // });

  // it('should update main.ts', async () => {
  //   const fileContent = tree.read(`./apps/${options.projectName}/src/main.ts`)?.toString('utf-8');
  //   expect(fileContent).toContain('WinstonLogger');
  //   expect(fileContent).toContain('app.useLogger(logger);');
  //   expect(fileContent).toContain('app.useGlobalFilters(new EntityNotFoundFilter(logger));');
  // });

  // it('should add core module declaration to app module', async () => {
  //   const fileContent = tree.read(`./apps/${options.projectName}/src/app/app.module.ts`)?.toString('utf-8');
  //   expect(fileContent).toContain('CoreModule');
  // });
});
