import {
  ArrayLiteralExpression,
  ClassDeclaration,
  IndentationText,
  ObjectLiteralExpression,
  Project,
  PropertyAssignment,
  PropertyAssignmentStructure,
  QuoteKind,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

export class ASTFileBuilder {
  private project: Project;
  private source: SourceFile;

  constructor(fileContent: string) {
    this.project = new Project({
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
      },
      useInMemoryFileSystem: true,
      skipLoadingLibFiles: true,
    });

    this.source = this.project.createSourceFile('file.ts', fileContent);
  }

  build(): string {
    return this.source.getFullText();
  }

  removeImports(importFrom: string): ASTFileBuilder {
    const importsDeclaration = this.source
      .getImportDeclarations()
      .filter(e => e.getModuleSpecifier().getLiteralValue() === importFrom);
    if (importsDeclaration && importsDeclaration.length) {
      importsDeclaration.forEach(e => {
        e.remove();
      });
    }

    return this;
  }

  addReturnTypeToFunction(functionName: string, returnType: string): ASTFileBuilder {
    const bootstrapFunction = this.source.getFunction(functionName);
    if (bootstrapFunction) {
      bootstrapFunction.set({ returnType });
    }

    return this;
  }

  updateImports(importFrom: string, newImportFrom: string): ASTFileBuilder {
    const importsDeclaration = this.source
      .getImportDeclarations()
      .filter(e => e.getModuleSpecifier().getLiteralValue() === importFrom);
    if (importsDeclaration && importsDeclaration.length) {
      importsDeclaration.forEach(e => {
        e.set({ moduleSpecifier: newImportFrom });
      });
    }

    return this;
  }

  addImports(importValues: string, importFrom: string): ASTFileBuilder {
    const importsDeclaration = this.source
      .getImportDeclarations()
      .filter(e => e.getModuleSpecifier().getLiteralValue() === importFrom);
    if (importsDeclaration && importsDeclaration.length) {
      const namedImports = importsDeclaration[0].getNamedImports().filter(e => e.getText() === importValues);
      if (namedImports) {
        if (!namedImports.length) {
          importsDeclaration[0].addNamedImport(importValues);
        }
      } else {
        importsDeclaration[0].addNamedImport(importValues);
      }
    } else {
      this.source.addImportDeclaration({
        moduleSpecifier: importFrom,
        namedImports: [{ name: importValues }],
      });
    }

    return this;
  }

  addDefaultImports(importValues: string, importFrom: string): ASTFileBuilder {
    const importsDeclaration = this.source
      .getImportDeclarations()
      .filter(e => e.getModuleSpecifier().getLiteralValue() === importFrom);
    if (importsDeclaration && importsDeclaration.length) {
      importsDeclaration[0].setDefaultImport(importValues);
    } else {
      this.source.addImportDeclaration({
        moduleSpecifier: importFrom,
        defaultImport: importValues,
      });
    }

    return this;
  }

  addImportsAs(importValues: string, importFrom: string): ASTFileBuilder {
    this.source.addImportDeclaration({
      moduleSpecifier: importFrom,
      namespaceImport: importValues,
    });

    return this;
  }

  addToModuleDecorator(
    moduleNameToAdd: string,
    moduleNameToInsert: string,
    property: string,
  ): ASTFileBuilder | undefined {
    try {
      const tsClass: ClassDeclaration = this.source.getClassOrThrow(moduleNameToAdd);
      const decorator = tsClass.getDecorators().filter(value => value.getName() === 'Module')[0];
      const argument = decorator.getArguments()[0] as ObjectLiteralExpression;
      const importsArg = argument.getProperty(property);

      if (importsArg) {
        const importsArgs = importsArg.getStructure() as PropertyAssignmentStructure;
        importsArgs.initializer = (importsArgs.initializer as string).replace('[', '[ ' + moduleNameToInsert + ',');
        argument.getProperty(property)!.set(importsArgs as any);
      } else {
        argument.addPropertyAssignment({
          name: property,
          initializer: '[' + moduleNameToInsert + ']',
        });
      }
    } catch (e) {
      // Do nothing
      return undefined;
    }

    return this;
  }

  insertLinesToFunctionAfter(functionName: string, lineContains: string, textToInsert: string): ASTFileBuilder {
    const bootstrapFunction = this.source.getFunction(functionName);
    const statements = bootstrapFunction!.getStatements();
    const statementIndex = statements.reduce((total, current, idx) => {
      if (current.getText().includes(lineContains)) {
        return idx + 1;
      }
      return total;
    }, -1);
    if (statementIndex >= 0) {
      if (statementIndex === statements.length) {
        bootstrapFunction!.addStatements(textToInsert);
      } else {
        const nextIdx = statements[statementIndex].getChildIndex();

        bootstrapFunction!.insertStatements(nextIdx, textToInsert);
      }
    }

    return this;
  }

  insertLinesToFunctionBefore(functionName: string, lineContains: string, textToInsert: string): ASTFileBuilder {
    const bootstrapFunction = this.source.getFunction(functionName);
    const statement = bootstrapFunction!.getStatement(node => node.getText().includes(lineContains));

    if (statement) {
      const statementIndex = statement.getChildIndex();
      bootstrapFunction!.insertStatements(statementIndex, textToInsert);
    }

    return this;
  }

  addTypeormFeatureToModule(moduleNameToAdd: string, entityName: string): ASTFileBuilder {
    try {
      const tsClass: ClassDeclaration = this.source.getClassOrThrow(moduleNameToAdd);
      const decorator = tsClass.getDecorators().filter(value => value.getName() === 'Module')[0];
      const argument = decorator.getArguments()[0] as ObjectLiteralExpression;
      const importsArg = argument.getProperty('imports');

      if (importsArg) {
        const importsArgs = importsArg.getStructure() as PropertyAssignmentStructure;
        const initializer: string = importsArgs.initializer as string;
        if (!initializer.includes('TypeOrmModule.forFeature')) {
          importsArgs.initializer = initializer.replace('[', '[ TypeOrmModule.forFeature([' + entityName + ']),\n\r');
          argument.getProperty('imports')!.set(importsArgs as any);
        } else {
          const regex = /TypeOrmModule\.forFeature\(\[([\s\S]*)\]\)/m;
          const typeormDeclaration = initializer.match(regex);

          if (typeormDeclaration) {
            importsArgs.initializer = initializer.replace(
              typeormDeclaration[0],
              `TypeOrmModule.forFeature([${entityName}, ${typeormDeclaration[1]}])`,
            );
            argument.getProperty('imports')!.set(importsArgs as any);
          }
        }
      } else {
        argument.addPropertyAssignment({
          name: 'imports',
          initializer: '[ TypeOrmModule.forFeature([' + entityName + '])]',
        });
      }
    } catch (e) {
      // do nothing
      // console.error(e);
    }

    return this;
  }

  addTypeormRepositoryToModule(moduleNameToAdd: string, repositoryName: string): ASTFileBuilder {
    try {
      const tsClass: ClassDeclaration = this.source.getClassOrThrow(moduleNameToAdd);
      const decorator = tsClass.getDecorators().filter(value => value.getName() === 'Module')[0];
      const argument = decorator.getArguments()[0] as ObjectLiteralExpression;
      const importsArg = argument.getProperty('imports');

      if (importsArg) {
        const importsArgs = importsArg.getStructure() as PropertyAssignmentStructure;
        const initializer: string = importsArgs.initializer as string;
        if (!initializer.includes('TypeOrmModule.forFeature')) {
          importsArgs.initializer = initializer.replace(
            '[',
            '[ TypeOrmModule.forFeature([' + repositoryName + 'Repository]),\n\r',
          );
          argument.getProperty('imports')!.set(importsArgs as any);
        } else {
          const regex = /TypeOrmModule\.forFeature\(\[([\s\S]*)\]\)/m;
          const typeormDeclaration = initializer.match(regex);

          if (typeormDeclaration) {
            importsArgs.initializer = initializer.replace(
              typeormDeclaration[0],
              `TypeOrmModule.forFeature([${repositoryName}Repository, ${typeormDeclaration[1]
                .replace(repositoryName + ',', '')
                .replace(repositoryName, '')}])`,
            );
            argument.getProperty('imports')!.set(importsArgs as any);
          }
        }
      } else {
        argument.addPropertyAssignment({
          name: 'imports',
          initializer: '[ TypeOrmModule.forFeature([' + repositoryName + 'Repository ])]',
        });
      }
    } catch (e) {
      // do nothing
      // console.error(e);
    }

    return this;
  }

  addPropertyToObjectLiteralVariable(
    varName: string,
    propertyName: string,
    propertyInitializer: string,
  ): ASTFileBuilder {
    const varDeclaration = this.source.getVariableDeclaration(varName);

    if (varDeclaration) {
      const object = varDeclaration.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);

      if (object && !object.getProperty(propertyName)) {
        object.addPropertyAssignment({
          name: propertyName,
          initializer: propertyInitializer,
        });
      }
    }

    return this;
  }

  addPropToInterface(interfaceName: string, propName: string, propType: string): ASTFileBuilder {
    const interfaceDeclaration = this.source.getInterface(interfaceName);
    if (interfaceDeclaration && !interfaceDeclaration.getProperty(propName)) {
      interfaceDeclaration.addProperty({ name: propName, type: propType });
    }

    return this;
  }

  addPropToClass(
    className: string,
    propName: string,
    propType: string,
    modif?: 'exclamation' | 'question',
  ): ASTFileBuilder {
    const classDeclaration = this.source.getClass(className);
    if (classDeclaration && !classDeclaration.getProperty(propName)) {
      classDeclaration.addProperty({
        name: propName,
        type: propType,
        hasExclamationToken: modif === 'exclamation',
        hasQuestionToken: modif === 'question',
      });
    }

    return this;
  }

  addDecoratorToClassProp(
    className: string,
    propName: string,
    decorators: { name: string; arguments?: string[] }[],
  ): ASTFileBuilder {
    const classDeclaration = this.source.getClass(className);
    if (classDeclaration) {
      const property = classDeclaration.getProperty(propName);

      if (property) {
        property.addDecorators(decorators);
      }
    }

    return this;
  }

  addGetterToClass(
    className: string,
    getterName: string,
    getterReturnType: string,
    getterContent: string,
  ): ASTFileBuilder {
    const classDeclaration = this.source.getClass(className);

    if (classDeclaration && !classDeclaration.getGetAccessor(getterName)) {
      classDeclaration.addGetAccessor({
        name: getterName,
        returnType: getterReturnType,
        statements: getterContent,
      });
    }

    return this;
  }

  addPropertyToObjectLiteralParam(
    varName: string,
    paramIndex: number,
    propertyName: string,
    propertyInitializer: string | string[],
  ): ASTFileBuilder {
    const varDeclaration = this.source.getVariableDeclaration(varName);

    if (varDeclaration) {
      const object =
        varDeclaration.getInitializerIfKind(SyntaxKind.NewExpression) ??
        varDeclaration.getInitializerIfKind(SyntaxKind.CallExpression);

      if (object) {
        const arg = object.getArguments()[paramIndex] as ObjectLiteralExpression | undefined;

        if (arg && arg.getKind() === SyntaxKind.ObjectLiteralExpression) {
          const property = arg.getProperty(propertyName);
          if (property) {
            const initializer = (property as PropertyAssignment).getInitializer();
            if (initializer?.getKind() === SyntaxKind.ArrayLiteralExpression) {
              if (Array.isArray(propertyInitializer)) {
                propertyInitializer.forEach(elem => {
                  (initializer as ArrayLiteralExpression).addElement(elem);
                });
              } else {
                (initializer as ArrayLiteralExpression).addElement(propertyInitializer);
              }
            } else {
              property.set({
                initializer: Array.isArray(propertyInitializer)
                  ? JSON.stringify(propertyInitializer).replace(/('|")/g, '')
                  : propertyInitializer,
              });
            }
          } else {
            arg.addPropertyAssignment({
              name: propertyName,
              initializer: Array.isArray(propertyInitializer)
                ? JSON.stringify(propertyInitializer).replace(/('|")/g, '')
                : propertyInitializer,
            });
          }
        }
      }
    }

    return this;
  }
}
