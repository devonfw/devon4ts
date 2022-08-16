import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';

describe('Convict Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('convict', {}).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should generate all files to configure convict in the project', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('convict', {}, tree).toPromise();

    expect(tree.files).toEqual(expect.arrayContaining(['/src/config.ts', '/config/develop.json', '/config/prod.json']));
  });

  it('should update the main in order to use properties from config', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('convict', {}, tree).toPromise();

    const mainContent = tree.readContent('/src/main.ts');
    expect(mainContent).toContain('await app.listen(config.port);');
    expect(mainContent).toContain('defaultVersion: config.defaultVersion,');
  });

  it('should update the logger in order to use properties from config', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('convict', {}, tree).toPromise();

    const mainContent = tree.readContent('/src/app/shared/logger/winston.logger.ts');
    expect(mainContent).toContain('oneLineStack(config.logger.oneLineStack),');
    expect(mainContent).toContain('colorize(config.logger.color),');
    expect(mainContent).toContain('level: config.logger.loggerLevel,');
  });
});
