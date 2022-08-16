import { Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, Rule, Tree, url } from '@angular-devkit/schematics';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { mergeFiles } from '../../utils/merge';
import {
  existsConvictConfig,
  formatTsFile,
  installNodePackages,
  stopExecutionIfNotRunningAtRootFolder,
} from '../../utils/tree-utils';
import { packagesVersion } from '../packagesVersion';

const swaggerTemplateWithConfig = `if (config.isDev) {
    const options = new DocumentBuilder()
      .setTitle(config.swagger?.title ?? 'NestJS application')
      .setDescription(config.swagger?.description ?? '')
      .setVersion(config.swagger?.version ?? '0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v' + (config.defaultVersion) + '/api', app, swaggerDoc);
  }`;

const swaggerTemplate = `if (process.env.NODE_ENV === 'develop') {
    const options = new DocumentBuilder()
      .setTitle('NestJS application')
      .setDescription('')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build();

    const swaggerDoc = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('v1/api', app, swaggerDoc);
  }`;

const defaultSwaggerConfig = `{
    title: {
      doc: 'Swagger documentation title',
      default: 'NestJS Application',
      format: String,
    },
    description: {
      doc: 'Swagger documentation description',
      default: 'API Documentation',
      format: String,
    },
    version: {
      doc: 'Swagger documentation version',
      default: '0.0.1',
      format: String,
    },
  },`;

function updatePackageJson(): Rule {
  return (tree: Tree): Tree => {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(tree.read(packageJsonPath)!.toString());

    packageJson.dependencies[packagesVersion.nestjsSwagger.packageName] = packagesVersion.nestjsSwagger.packageVersion;
    tree.overwrite(packageJsonPath, JSON.stringify(packageJson, null, 2));

    return tree;
  };
}

function updateBaseEntity() {
  return (tree: Tree): Tree => {
    const baseEntityPath = 'src/app/shared/model/entities/base.entity.ts';

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

function updateNestCliJson() {
  return (tree: Tree): Tree => {
    const nestCliJsonPath = 'nest-cli.json';
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

function updateConfigTypeFile(tree: Tree): void {
  const typesFile: Path = 'src/config.ts' as Path;

  let typesFileContent = tree.read(typesFile)!.toString('utf-8');
  typesFileContent = new ASTFileBuilder(typesFileContent)
    .addPropertyToObjectLiteralParam('config', 0, 'swagger', defaultSwaggerConfig)
    .build();

  tree.overwrite(typesFile, formatTsFile(typesFileContent));
}

function updateMain() {
  return (tree: Tree): Tree => {
    const config = existsConvictConfig(tree);

    const mainPath = 'src/main.ts';
    const main = new ASTFileBuilder(tree.read(mainPath)!.toString())
      .addImports('DocumentBuilder', '@nestjs/swagger')
      .addImports('SwaggerModule', '@nestjs/swagger');

    if (!config) {
      main.insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplate);
    } else {
      main.insertLinesToFunctionBefore('bootstrap', 'app.listen', swaggerTemplateWithConfig);
      updateConfigTypeFile(tree);
    }

    if (main) {
      tree.overwrite(mainPath, formatTsFile(main.build()));
    }
    return tree;
  };
}

export function swagger(): Rule {
  return (tree: Tree): Rule => {
    return chain([
      stopExecutionIfNotRunningAtRootFolder(),
      mergeWith(apply(url('./files'), [mergeFiles(tree)])),
      updatePackageJson(),
      updateMain(),
      updateNestCliJson(),
      updateBaseEntity(),
      installNodePackages(),
    ]);
  };
}
