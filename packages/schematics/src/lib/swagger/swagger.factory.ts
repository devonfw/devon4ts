import { join, Path } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import {
  addDecoratorToClassProp,
  addEntryToObjctLiteralVariable,
  addImports,
  addPropToClass,
  insertLinesToFunctionBefore,
} from '~utils/ast-utils';
import { existsConfigModule, formatTsFile } from '~utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

const templateWithConfig = `if (configModule.values.isDev) {
    const options = new DocumentBuilder()
      .setTitle(configModule.values.swaggerConfig.swaggerTitle)
      .setDescription(configModule.values.swaggerConfig.swaggerDescription)
      .setVersion(configModule.values.swaggerConfig.swaggerVersion)
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup((configModule.values.globalPrefix || '') + '/api', app, swaggerDoc);
  }`;

const template = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion('0.0.1')
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

const swaggerInterface = `export class SwaggerConfig {
  @IsDefined()
  @IsString()
  swaggerTitle!: string;
  @IsDefined()
  @IsString()
  swaggerDescription!: string;
  @IsDefined()
  @IsString()
  swaggerVersion!: string;
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

function updateBaseEntity(project: string) {
  return (tree: Tree): Tree => {
    const baseEntityPath = join(project as Path, 'src/app/shared/model/entities/base-entity.entity.ts');

    if (!tree.exists(baseEntityPath)) {
      return tree;
    }

    let fileContent = tree.read(baseEntityPath)!.toString();
    fileContent = addImports(fileContent, 'ApiHideProperty', '@nestjs/swagger');
    fileContent = addDecoratorToClassProp(fileContent, 'BaseEntity', 'version', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ]);
    fileContent = addDecoratorToClassProp(fileContent, 'BaseEntity', 'createdAt', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ]);
    fileContent = addDecoratorToClassProp(fileContent, 'BaseEntity', 'updatedAt', [
      {
        name: 'ApiHideProperty',
        arguments: [],
      },
    ]);

    if (fileContent) {
      tree.overwrite(baseEntityPath, fileContent);
    }

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

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');

  typesFileContent = addImports(typesFileContent, 'IsDefined', 'class-validator');
  typesFileContent = addImports(typesFileContent, 'IsString', 'class-validator');
  typesFileContent = addImports(typesFileContent, 'ValidateNested', 'class-validator');
  typesFileContent = addImports(typesFileContent, 'Type', 'class-transformer');
  typesFileContent = addPropToClass(typesFileContent, 'Config', 'swaggerConfig', 'SwaggerConfig', 'question');
  typesFileContent = typesFileContent.replace('export class Config', swaggerInterface + '\n\nexport class Config');
  typesFileContent = addDecoratorToClassProp(typesFileContent, 'Config', 'swaggerConfig', [
    {
      name: 'IsDefined',
      arguments: [],
    },
    {
      name: 'ValidateNested',
      arguments: [],
    },
    {
      name: 'Type',
      arguments: ['() => SwaggerConfig'],
    },
  ]);

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateConfigFiles(project: string | undefined, tree: Tree): void {
  const configDir: Path = join((project || '.') as Path, 'src/config');

  tree
    .getDir(configDir)
    .subfiles.filter(file => ['default.ts', 'develop.ts', 'test.ts'].includes(file))
    .forEach(file => {
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
  return chain([
    updatePackageJson(projectPath),
    updateMain(projectPath),
    updateNestCliJson(projectPath),
    updateBaseEntity(projectPath),
  ]);
}
