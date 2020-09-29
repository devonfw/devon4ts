import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Typeorm Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));
  it('should work', () => {
    const app: object = {
      name: '',
    };
    const options: object = {
      db: 'mysql',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('typeorm', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/docker-compose.yml')).toBeDefined();
        expect(files.find(filename => filename === '/ormconfig.json')).toBeDefined();
        expect(
          files.find(filename => filename === '/src/app/shared/model/entities/base-entity.entity.ts'),
        ).toBeDefined();

        expect(tree.readContent('/src/app/shared/model/entities/base-entity.entity.ts')).toEqual(
          "import { PrimaryGeneratedColumn, VersionColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';\n" +
            "import { Exclude } from 'class-transformer';\n" +
            '\n' +
            'export abstract class BaseEntity {\n' +
            "  @PrimaryGeneratedColumn('increment')\n" +
            '  id!: number;\n' +
            '\n' +
            '  @VersionColumn({ default: 1 })\n' +
            '  @Exclude({ toPlainOnly: true })\n' +
            '  version!: number;\n' +
            '\n' +
            '  @CreateDateColumn()\n' +
            '  @Exclude({ toPlainOnly: true })\n' +
            '  createdAt!: string;\n' +
            '\n' +
            '  @UpdateDateColumn()\n' +
            '  @Exclude({ toPlainOnly: true })\n' +
            '  updatedAt!: string;\n' +
            '}\n',
        );
      });
    });
  });
  it('should manage path', () => {
    const app: object = {
      name: 'foo',
    };
    const options: object = {
      db: 'mysql',
      path: 'foo',
    };
    runner.runSchematicAsync('application', app).subscribe(tree => {
      runner.runSchematicAsync('typeorm', options, tree).subscribe(tree => {
        const files: string[] = tree.files;
        expect(files.find(filename => filename === '/foo/docker-compose.yml')).toBeDefined();
        expect(files.find(filename => filename === '/foo/ormconfig.json')).toBeDefined();
        expect(
          files.find(filename => filename === '/foo/src/app/shared/model/entities/base-entity.entity.ts'),
        ).toBeDefined();
      });
    });
  });
});
