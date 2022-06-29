import { join, Path, strings } from '@angular-devkit/core';
import { chain, Rule, Tree } from '@angular-devkit/schematics';
import { existsConfigModule, formatTsFile, installNodePackages } from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';
import { ASTFileBuilder } from '../../utils/ast-file-builder';

const templateWithConfig = `if (configModule.values.isDev) {
    const options = new DocumentBuilder()
      .setTitle(configModule.values.swaggerConfig?.swaggerTitle ?? 'NestJS application')
      .setDescription(configModule.values.swaggerConfig?.swaggerDescription ?? '')
      .setVersion(configModule.values.swaggerConfig?.swaggerVersion ?? '0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v' + (configModule.values.defaultVersion) + '/api', app, swaggerDoc);
  }`;

const template = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v1/api', app, swaggerDoc);
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

    packageJson.dependencies[packagesVersion.nestjsSwagger.packageName] = packagesVersion.nestjsSwagger.packageVersion;
    packageJson.dependencies[packagesVersion.swaggerUiExpress.packageName] =
      packagesVersion.swaggerUiExpress.packageVersion;
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

    const fileContent = new ASTFileBuilder(tree.read(baseEntityPath)!.toString())
      .addImports('ApiHideProperty', '@nestjs/swagger')
      .addDecoratorToClassProp('BaseEntity', 'version', [
        {
          name: 'ApiHideProperty',
          arguments: [],
        },
      ])
      .addDecoratorToClassProp('BaseEntity', 'createdAt', [
        {
          name: 'ApiHideProperty',
          arguments: [],
        },
      ])
      .addDecoratorToClassProp('BaseEntity', 'updatedAt', [
        {
          name: 'ApiHideProperty',
          arguments: [],
        },
      ])
      .build();

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
        nestCliJson.compilerOptions.plugins.push('@nestjs/swagger');
      } else {
        nestCliJson.compilerOptions.plugins = ['@nestjs/swagger'];
      }
    } else {
      nestCliJson.compilerOptions = {
        plugins: ['@nestjs/swagger'],
      };
    }

    tree.overwrite(nestCliJsonPath, JSON.stringify(nestCliJson, null, 2));

    return tree;
  };
}

function updateConfigTypeFile(project: string | undefined, tree: Tree): void {
  const typesFile: Path = join((project || '.') as Path, 'src/app/shared/model/config/config.model.ts');

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = typesFileContent.replace('export class Config', swaggerInterface + '\n\nexport class Config');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addImports('IsDefined', 'class-validator')
    .addImports('IsString', 'class-validator')
    .addImports('ValidateNested', 'class-validator')
    .addImports('Type', 'class-transformer')
    .addPropToClass('Config', 'swaggerConfig', 'SwaggerConfig', 'question')
    .addDecoratorToClassProp('Config', 'swaggerConfig', [
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
    ])
    .build();

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
          new ASTFileBuilder(tree.read(join(configDir, file))!.toString('utf-8'))
            .addEntryToObjctLiteralVariable('def', 'swaggerConfig', defaultSwaggerValue)
            .build(),
        ),
      );
    });
}

function updateMain(project: string) {
  return (tree: Tree): Tree => {
    const config = existsConfigModule(tree, project || '.');

    const mainPath = join(project as Path, 'src/main.ts');
    const main = new ASTFileBuilder(tree.read(mainPath)!.toString())
      .addImports('DocumentBuilder', '@nestjs/swagger')
      .addImports('SwaggerModule', '@nestjs/swagger');

    if (!config) {
      main.insertLinesToFunctionBefore('bootstrap', 'app.listen', template);
    } else {
      main.insertLinesToFunctionBefore('bootstrap', 'app.listen', templateWithConfig);
      updateConfigTypeFile(project, tree);
      updateConfigFiles(project, tree);
    }

    if (main) {
      tree.overwrite(mainPath, formatTsFile(main.build()));
    }
    return tree;
  };
}

export function swagger(options: { path?: string }): Rule {
  return (): any => {
    if (!options.path) {
      options.path = '.';
    }
    options.path = strings.dasherize(options.path);
    return chain([
      updatePackageJson(options.path),
      updateMain(options.path),
      updateNestCliJson(options.path),
      updateBaseEntity(options.path),
      installNodePackages(),
    ]);
  };
}
