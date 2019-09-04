import { Rule, chain, Tree } from '@angular-devkit/schematics';
import { join, Path } from '@angular-devkit/core';
import { packagesVersion } from '../packagesVersion';
import { ModuleFinder } from '@nestjs/schematics/utils/module.finder';
import {
  addEntryToObjctLiteralVariable,
  addGetterToClass,
} from '../../utils/ast-utils';
import {
  addImports,
  insertLinesToFunctionBefore,
  addPropToInterface,
} from '../../utils/ast-utils';

const templateWithConfig = `if (configModule.isDev) {
    const options = new DocumentBuilder()
      .setTitle(configModule.swaggerConfig.swaggerTitle)
      .setDescription(configModule.swaggerConfig.swaggerDescription)
      .setVersion(configModule.swaggerConfig.swaggerVersion)
      .setHost(configModule.host + ':' + configModule.port)
      .setBasePath(configModule.swaggerConfig.swaggerBasepath)
      .addBearerAuth('Authorization', 'header')
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup((configModule.globalPrefix || '') + '/api', app, swaggerDoc);
  }`;

const template = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion(0.0.1)
      .setHost(localhost:3000)
      .setBasePath('v1')
      .addBearerAuth('Authorization', 'header')
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, swaggerDoc);
  }`;

const defaultSwaggerValue = `{
    swaggerTitle: 'NestJS Application',
    swaggerDescription: 'API Documentation',
    swaggerVersion: '0.0.1',
    swaggerBasepath: 'v1',
  },`;

const swaggerInterface = `export interface ISwaggerConfig {
  swaggerTitle: string;
  swaggerDescription: string;
  swaggerVersion: string;
  swaggerBasepath: string;
}`;

export function swagger(options: { path?: string }): Rule {
  const projectPath = options.path || '.';
  return chain([updatePackageJson(projectPath), updateMain(projectPath)]);
}

function updatePackageJson(project: string): Rule {
  return (tree: Tree): Tree => {
    const packageJsonPath = join(project as Path, 'package.json');
    const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

    packageJson.dependencies['@nestjs/swagger'] = packagesVersion.nestjsSwagger;
    packageJson.dependencies['swagger-ui-express'] =
      packagesVersion.swaggerUiExpress;
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return tree;
  };
}

function updateMain(project: string) {
  return (tree: Tree): Tree => {
    const config = new ModuleFinder(tree).find({
      name: 'configuration',
      path: join('.' as Path, project || '.', 'src/app/core/') as Path,
    });

    const mainPath = join(project as Path, 'src/main.ts');
    let main = tree.read(mainPath)!.toString();
    main = addImports(main, 'DocumentBuilder', '@nestjs/swagger');
    main = addImports(main, 'SwaggerModule', '@nestjs/swagger');

    if (!config) {
      main = insertLinesToFunctionBefore(
        main,
        'bootstrap',
        'app.listen',
        template,
      );
    } else {
      main = insertLinesToFunctionBefore(
        main,
        'bootstrap',
        'app.listen',
        templateWithConfig,
      );
      updateConfigurationService(project, tree);
      updateConfigTypeFile(project, tree);
      updateConfigFiles(project, tree);
    }

    if (main) {
      tree.overwrite(mainPath, main);
    }
    return tree;
  };
}

function updateConfigurationService(project: string | undefined, tree: Tree) {
  const configServicePath = join(
    '.' as Path,
    project || '.',
    'src/app/core/configuration/services/configuration.service.ts',
  );

  let configServiceContent = tree.read(configServicePath)!.toString();
  configServiceContent = addImports(
    configServiceContent,
    'ISwaggerConfig',
    '../model',
  );
  configServiceContent = addGetterToClass(
    configServiceContent,
    'ConfigurationService',
    'swaggerConfig',
    'ISwaggerConfig',
    'return { ...this.get("swaggerConfig")! } as ISwaggerConfig;',
  );

  tree.overwrite(configServicePath, configServiceContent);
}

function updateConfigTypeFile(project: string | undefined, tree: Tree) {
  const typesFile: Path = join(
    (project || '.') as Path,
    'src/app/core/configuration/model/types.ts',
  );

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');

  typesFileContent = addPropToInterface(
    typesFileContent,
    'IConfig',
    'swaggerConfig',
    'ISwaggerConfig',
  );

  typesFileContent = typesFileContent.concat('\n', swaggerInterface);

  tree.overwrite(typesFile, typesFileContent);
}

function updateConfigFiles(project: string | undefined, tree: Tree) {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree.getDir(configDir).subfiles.forEach(file => {
    tree.overwrite(
      join(configDir, file),
      addEntryToObjctLiteralVariable(
        tree.read(join(configDir, file))!.toString('utf-8'),
        'def',
        'swaggerConfig',
        defaultSwaggerValue,
      ),
    );
  });
}
