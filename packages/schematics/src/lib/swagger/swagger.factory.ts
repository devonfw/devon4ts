import { join, Path } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import {
  addEntryToObjctLiteralVariable,
  addGetterToClass,
  addImports,
  addPropToInterface,
  insertLinesToFunctionBefore,
} from '../../utils/ast-utils';
import { existsConfigModule, formatTsFile } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

const templateWithConfig = `if (configModule.isDev) {
    const options = new DocumentBuilder()
      .setTitle(configModule.swaggerConfig.swaggerTitle)
      .setDescription(configModule.swaggerConfig.swaggerDescription)
      .setVersion(configModule.swaggerConfig.swaggerVersion)
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup((configModule.globalPrefix || '') + '/api', app, swaggerDoc);
  }`;

const template = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion(0.0.1)
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, swaggerDoc);
  }`;

const defaultSwaggerValue = `{
    swaggerTitle: 'NestJS Application',
    swaggerDescription: 'API Documentation',
    swaggerVersion: '0.0.1',
  },`;

const swaggerInterface = `export interface ISwaggerConfig {
  swaggerTitle: string;
  swaggerDescription: string;
  swaggerVersion: string;
}`;

function updatePackageJson(project: string): Rule {
  return (tree: Tree): Tree => {
    const packageJsonPath = join(project as Path, 'package.json');
    const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

    packageJson.dependencies['@nestjs/swagger'] = packagesVersion.nestjsSwagger;
    packageJson.dependencies['swagger-ui-express'] = packagesVersion.swaggerUiExpress;
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return tree;
  };
}

function updateNestCliJson(project: string) {
  return (tree: Tree): Tree => {
    const nestCliJsonPath = join(project as Path, 'nest-cli.json');
    const nestCliJson = JSON.parse(tree.read(nestCliJsonPath)!.toString());

    if (nestCliJson.compilerOptions) {
      if (nestCliJson.compilerOptions.plugins) {
        nestCliJson.compilerOptions.plugins.push('@nestjs/swagger/plugin');
      } else {
        nestCliJson.compilerOptions.plugins = ['@nestjs/swagger/plugin'];
      }
    } else {
      nestCliJson.compilerOptions = {
        plugins: ['@nestjs/swagger/plugin'],
      };
    }

    tree.overwrite(nestCliJsonPath, JSON.stringify(nestCliJson, null, 2));

    return tree;
  };
}

function updateConfigurationService(project: string | undefined, tree: Tree): void {
  const configServicePath = join(
    '.' as Path,
    project || '.',
    'src/app/core/configuration/services/configuration.service.ts',
  );

  let configServiceContent = tree.read(configServicePath)!.toString();
  configServiceContent = addImports(configServiceContent, 'ISwaggerConfig', '../model/types');
  configServiceContent = addGetterToClass(
    configServiceContent,
    'ConfigurationService',
    'swaggerConfig',
    'ISwaggerConfig',
    'return { ...this.get("swaggerConfig")! } as ISwaggerConfig;',
  );

  tree.overwrite(configServicePath, formatTsFile(configServiceContent));
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/core/configuration/model/types.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');

  typesFileContent = addPropToInterface(typesFileContent, 'IConfig', 'swaggerConfig', 'ISwaggerConfig');

  typesFileContent = typesFileContent.concat('\n', swaggerInterface);

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      formatTsFile(
        addEntryToObjctLiteralVariable(
          tree.read(join(configDir, file))!.toString('utf-8'),
          'def',
          'swaggerConfig',
          defaultSwaggerValue,
        ),
      ),
    );
  });
}

function updateMain(project: string) {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, project || '.');

    const mainPath = join(project as Path, 'src/main.ts');
    let main = tree.read(mainPath)!.toString();
    main = addImports(main, 'DocumentBuilder', '@nestjs/swagger');
    main = addImports(main, 'SwaggerModule', '@nestjs/swagger');

    if (!config) {
      main = insertLinesToFunctionBefore(main, 'bootstrap', 'app.listen', template);
    } else {
      main = insertLinesToFunctionBefore(main, 'bootstrap', 'app.listen', templateWithConfig);
      updateConfigurationService(project, tree);
      updateConfigTypeFile(project, tree);
      updateConfigFiles(project, tree);
    }

    if (main) {
      tree.overwrite(mainPath, formatTsFile(main));
    }
    return tree;
  };
}

export function swagger(options: { path?: string }): Rule {
  const projectPath = options.path || '.';
  return chain([updatePackageJson(projectPath), updateMain(projectPath), updateNestCliJson(projectPath)]);
}
