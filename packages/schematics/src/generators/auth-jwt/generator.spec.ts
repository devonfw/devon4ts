import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJsonFile, readProjectConfiguration } from '@nx/devkit';
import { authJwtGenerator } from './generator';
import { AuthJwtGeneratorSchema } from './schema';

describe('auth-jwt generator', () => {
  let tree: Tree;
  const options: AuthJwtGeneratorSchema = { projectName: 'test' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await authJwtGenerator(tree, options);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });

  it('should add dependencies to package.json', async () => {
    const fileContent = tree.read('package.json')?.toString('utf-8');
    expect(fileContent).toMatch(/"devDependencies": {(.|\n)*"@types\/passport":/g);
    expect(fileContent).toMatch(/"devDependencies": {(.|\n)*"@types\/passport-jwt":/g);
    expect(fileContent).toMatch(/"devDependencies": {(.|\n)*"@types\/bcrypt":/g);
    expect(fileContent).toMatch(/"devDependencies": {(.|\n)*"@types\/lodash":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"bcrypt":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"passport":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"passport-jwt":/g);
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"lodash":/g);
  });

  it('should have config files', async () => {
    expect(tree.exists(`./apps/${options.projectName}/config/prod.json`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/config/develop.json`)).toBeTruthy();
  });

  it('should create test files and core modules', async () => {
    expect(tree.exists(`./apps/${options.projectName}/test/auth/auth.service.mock.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/test/user/user.repository.mock.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/src/app/core/auth/auth.module.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/src/app/core/user/user.module.ts`)).toBeTruthy();
  });

  it('should add auth and user modules to core module', async () => {
    const fileContent = tree.read(`./apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8');
    expect(fileContent).toContain('AuthModule');
    expect(fileContent).toContain('UserModule');
  });

  it('should add JWT configuration if convict is present', async () => {
    if (tree.exists(`./apps/${options.projectName}/src/config.ts`)) {
      const fileContent = readJsonFile(`./apps/${options.projectName}/src/config.ts`);
      expect(fileContent).toMatchObject({
        jwt: {
          secret: {
            doc: 'JWT secret',
            format: String,
            default: 'SECRET',
            env: 'JWT_SECRET',
            arg: 'jwtSecret',
            secret: true,
          },
          expiration: {
            doc: 'Token expiration time',
            default: '24h',
            format: String,
            env: 'JWT_EXPIRATION',
          },
        },
      });
      const typesContent = tree.read(`./apps/${options.projectName}/src/app/shared/app-config.ts`)?.toString('utf-8');
      expect(typesContent).toContain('jwt');
    }
  });
});
