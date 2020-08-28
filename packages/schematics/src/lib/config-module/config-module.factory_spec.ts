import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe('schematics', () => {
  it('works', done => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    const obsTree = runner.runSchematicAsync('schematics', {}, Tree.empty());

    obsTree.subscribe(tree => {
      expect(tree.files).toEqual([]);
      done();
    });
  });
});
