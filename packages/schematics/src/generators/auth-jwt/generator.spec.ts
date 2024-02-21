import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';
import { authJwtGenerator } from './generator';
import { AuthJwtGeneratorSchema } from './schema';
import applicationGenerator from '../application/generator';
import convictGenerator from '../convict/generator';

describe('auth-jwt generator', () => {
  let tree: Tree;
  const options: AuthJwtGeneratorSchema = { projectName: 'test' };

  beforeAll(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, options);
    jest.clearAllMocks();
  }, 15000);

  it('should run successfully', async () => {
    await authJwtGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
  it('should add dependencies to package.json', async () => {
    await authJwtGenerator(tree, options);
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

  it('should create test files and core modules', async () => {
    await authJwtGenerator(tree, options);
    expect(tree.exists(`./apps/${options.projectName}/test/auth/auth.service.mock.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/test/user/user.repository.mock.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/src/app/core/auth/auth.module.ts`)).toBeTruthy();
    expect(tree.exists(`./apps/${options.projectName}/src/app/core/user/user.module.ts`)).toBeTruthy();
  });

  it('should add auth and user modules to core module', async () => {
    await authJwtGenerator(tree, options);
    const fileContent = tree.read(`./apps/${options.projectName}/src/app/core/core.module.ts`)?.toString('utf-8');
    expect(fileContent).toContain('AuthModule');
    expect(fileContent).toContain('UserModule');
  });

  describe('auth-jwt generator without convict configuration', () => {
    beforeAll(async () => {
      await authJwtGenerator(tree, options);
      jest.clearAllMocks();
    }, 15000);
    it('should not have configuration files', async () => {
      expect(tree.exists(`./apps/${options.projectName}/config/prod.json`)).toBeFalsy();
      expect(tree.exists(`./apps/${options.projectName}/config/develop.json`)).toBeFalsy();
    });

    it('should not have convict files', async () => {
      expect(tree.exists(`./apps/${options.projectName}/src/config.ts`)).toBeFalsy();
      expect(tree.exists(`./apps/${options.projectName}/src/app/shared/app-config.ts`)).toBeFalsy();
    });

    it('should not include config imports', async () => {
      const fileContent = tree
        .read(`./apps/${options.projectName}/src/app/core/auth/auth.module.ts`)
        ?.toString('utf-8');
      expect(fileContent).not.toContain('import config');
      expect(fileContent).not.toContain('secret: config.jwt.secret,');
      expect(fileContent).not.toContain('signOptions: { expiresIn: config.jwt.expiration },');

      expect(fileContent).toContain("secret: 'SECRET'");
      expect(fileContent).toContain("signOptions: { expiresIn: '60s' },");
    });
  });

  describe('auth-jwt generator with convict configuration', () => {
    beforeAll(async () => {
      await convictGenerator(tree, options);
      await authJwtGenerator(tree, options);
      jest.clearAllMocks();
    }, 15000);

    it('should add JWT configuration if convict is present', async () => {
      if (tree.exists(`./apps/${options.projectName}/src/config.ts`)) {
        const fileContent = tree.read(`./apps/${options.projectName}/src/config.ts`)?.toString();
        // expect(fileContent).toContain({
        //   jwt: {
        //     secret: {
        //       doc: 'JWT secret',
        //       format: String,
        //       default: 'SECRET',
        //       env: 'JWT_SECRET',
        //       arg: 'jwtSecret',
        //       secret: true,
        //     },
        //     expiration: {
        //       doc: 'Token expiration time',
        //       default: '24h',
        //       format: String,
        //       env: 'JWT_EXPIRATION',
        //     },
        //   },
        // });
        expect(fileContent).toContain('jwt: {');
        expect(fileContent).toContain('secret: {');
        expect(fileContent).toContain('expiration: {');

        const typesContent = tree.read(`./apps/${options.projectName}/src/app/shared/app-config.ts`)?.toString('utf-8');
        expect(typesContent).toContain('jwt');
      }
    });
    it('should include config imports', async () => {
      const fileContent = tree
        .read(`./apps/${options.projectName}/src/app/core/auth/auth.module.ts`)
        ?.toString('utf-8');
      expect(fileContent).toContain('import config');
      expect(fileContent).toContain('secret: config.jwt.secret,');
      expect(fileContent).toContain('signOptions: { expiresIn: config.jwt.expiration },');

      expect(fileContent).not.toContain("secret: 'SECRET'");
      expect(fileContent).not.toContain("signOptions: { expiresIn: '60s' },");
    });
  });
});
