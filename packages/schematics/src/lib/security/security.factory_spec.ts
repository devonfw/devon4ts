import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Security Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner.runSchematicAsync('security', {}).subscribe(
      () => {
        fail();
      },
      error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4node project root folder.'));
        done();
      },
    );
  });

  it('should add dependencies to package.json', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('security', {}, tree).toPromise();

    const fileContent = tree.readContent('/package.json');
    expect(fileContent).toMatch(/"dependencies": {(.|\n)*"helmet":/g);
  });

  it('should main.ts to add CORS and helmet', async () => {
    let tree = await runner.runSchematicAsync('application', { name: '' }).toPromise();
    tree = await runner.runSchematicAsync('security', {}, tree).toPromise();

    const fileContent = tree.readContent('/src/main.ts');
    expect(fileContent).toContain('app.enableCors');
    expect(fileContent).toContain(`import helmet from 'helmet'`);
  });
});
