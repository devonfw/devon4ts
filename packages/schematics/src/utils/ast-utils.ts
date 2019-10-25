import {
  ClassDeclaration,
  IndentationText,
  ObjectLiteralExpression,
  Project,
  PropertyAssignmentStructure,
  QuoteKind,
  SyntaxKind,
  SourceFile,
} from 'ts-morph';

export function addImports(fileContent: string, importValues: string, importFrom: string): string {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  addImportsFromTsFile(tsFile, importFrom, importValues);

  return tsFile.getText();
}

function addImportsFromTsFile(tsFile: SourceFile, importFrom: string, importValues: string) {
  const importsDeclaration = tsFile
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
    tsFile.addImportDeclaration({
      moduleSpecifier: importFrom,
      namedImports: [{ name: importValues }],
    });
  }
}

export function addDefaultImports(fileContent: string, importValues: string, importFrom: string): string {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  tsFile.addImportDeclaration({
    moduleSpecifier: importFrom,
    namespaceImport: importValues,
  });

  return tsFile.getText();
}

export function addToModuleDecorator(
  moduleToAddContent: string,
  moduleNameToAdd: string,
  moduleToInsert: string,
  moduleNameToInsert: string,
  property: string,
  exports: boolean,
) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', moduleToAddContent);

  try {
    addImportsFromTsFile(
      tsFile,
      moduleToInsert,
      moduleNameToInsert.includes('.') ? moduleNameToInsert.split('.')[0] : moduleNameToInsert,
    );

    const tsClass: ClassDeclaration = tsFile.getClassOrThrow(moduleNameToAdd);
    const decorator = tsClass.getDecorators().filter(value => value.getName() === 'Module')[0];
    const argument = decorator.getArguments()[0] as ObjectLiteralExpression;
    const importsArg = argument.getProperty(property);

    if (importsArg) {
      const importsArgs = importsArg.getStructure() as PropertyAssignmentStructure;
      importsArgs.initializer = (importsArgs.initializer as string).replace('[', '[ ' + moduleNameToInsert + ',');
      argument.getProperty(property)!.set(importsArgs as any);
    } else {
      argument.addProperty({
        kind: 29,
        name: property,
        initializer: '[' + moduleNameToInsert + ']',
      });
    }

    if (exports) {
      const exportsArg = argument.getProperty('exports');

      if (exportsArg) {
        const exportsArgs = exportsArg.getStructure() as PropertyAssignmentStructure;
        exportsArgs.initializer = (exportsArgs.initializer as string).replace(
          '[',
          '[ ' + (moduleNameToInsert.includes('.') ? moduleNameToInsert.split('.')[0] : moduleNameToInsert) + ',',
        );
        argument.getProperty('exports')!.set(exportsArgs as any);
      } else {
        argument.addProperty({
          kind: 29,
          name: 'exports',
          initializer:
            '[' + (moduleNameToInsert.includes('.') ? moduleNameToInsert.split('.')[0] : moduleNameToInsert) + ']',
        });
      }
    }
  } catch (e) {
    return undefined;
  }

  return tsFile.getText();
}

export function insertLinesToFunctionAfter(
  fileContent: string,
  functionName: string,
  lineContains: string,
  textToInsert: string,
) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  const bootstrapFunction = tsFile.getFunction(functionName);
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

  return tsFile.getFullText();
}

export function insertLinesToFunctionBefore(
  fileContent: string,
  functionName: string,
  lineContains: string,
  textToInsert: string,
) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  const bootstrapFunction = tsFile.getFunction(functionName);
  const statement = bootstrapFunction!.getStatement(node => node.getText().includes(lineContains));

  if (statement) {
    const statementIndex = statement.getChildIndex();
    bootstrapFunction!.insertStatements(statementIndex, textToInsert);
  }

  return tsFile.getFullText();
}

export function addTypeormFeatureToModule(moduleToAddContent: string, moduleNameToAdd: string, entityName: string) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', moduleToAddContent);

  try {
    const tsClass: ClassDeclaration = tsFile.getClassOrThrow(moduleNameToAdd);
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
      argument.addProperty({
        kind: 29,
        name: 'imports',
        initializer: '[ TypeOrmModule.forFeature([' + entityName + '])]',
      });
    }
  } catch (e) {
    // do nothing
  }

  return tsFile.getText();
}

export function addEntryToObjctLiteralVariable(
  fileContent: string,
  varName: string,
  propName: string,
  propInitializer: string,
) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  const varDeclaration = tsFile.getVariableDeclaration(varName);

  if (varDeclaration) {
    const object = varDeclaration.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);

    if (object && !object.getProperty(propName)) {
      object.addPropertyAssignment({
        name: propName,
        initializer: propInitializer,
      });
    }
  }

  return tsFile.getText();
}

export function addPropToInterface(fileContent: string, interfaceName: string, propName: string, propType: string) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  const interfaceDeclaration = tsFile.getInterface(interfaceName);
  if (interfaceDeclaration && !interfaceDeclaration.getProperty(propName)) {
    interfaceDeclaration.addProperty({ name: propName, type: propType });
  }

  return tsFile.getText();
}

export function addGetterToClass(
  fileContent: string,
  className: string,
  getterName: string,
  getterReturnType: string,
  getterContent: string,
) {
  const tsProject = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
      quoteKind: QuoteKind.Single,
    },
    useVirtualFileSystem: true,
  });

  const tsFile = tsProject.createSourceFile('file.ts', fileContent);

  const classDeclaration = tsFile.getClass(className);

  if (classDeclaration && !classDeclaration.getGetAccessor(getterName)) {
    classDeclaration.addGetAccessor({
      name: getterName,
      returnType: getterReturnType,
      statements: getterContent,
    });
  }

  return tsFile.getText();
}
