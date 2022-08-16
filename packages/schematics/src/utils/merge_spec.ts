import { Path } from '@angular-devkit/core';
import { FileEntry, Tree } from '@angular-devkit/schematics';
import { load } from 'js-yaml';
import { mergeJsonFile, mergeYmlFile } from './merge';

describe('Merge', () => {
  describe('mergeJsonFile', () => {
    it('should merge in depth json files', () => {
      const unitTree = Tree.empty();
      unitTree.create(
        '/todo.json',
        JSON.stringify({
          prop1: 'hello',
          prop2: ['a', 'b', 'c'],
          prop3: {
            prop4: 'd',
          },
        }),
      );

      const input: FileEntry = {
        path: '/todo.json' as Path,
        content: Buffer.from(
          JSON.stringify({
            prop1: 'bye',
            prop2: ['f'],
            prop3: {
              prop5: 'g',
            },
          }),
        ),
      };

      const expected = {
        prop1: 'bye',
        prop2: ['f'],
        prop3: {
          prop4: 'd',
          prop5: 'g',
        },
      };

      mergeJsonFile(unitTree, input);

      expect(unitTree.readText('/todo.json')).toStrictEqual(JSON.stringify(expected, null, 2));
    });
  });

  describe('mergeYmlFile', () => {
    it('should merge in depth yaml files', () => {
      const unitTree = Tree.empty();
      unitTree.create(
        '/todo.yaml',
        `prop1: hello
prop2:
  - a
  - b
  - c
prop3:
  prop4: d
prop6: asdf`,
      );

      const input: FileEntry = {
        path: '/todo.yaml' as Path,
        content: Buffer.from(
          `prop1: bye
prop2:
  - f
prop3:
  prop5: g`,
        ),
      };

      const expected = {
        prop1: 'bye',
        prop2: ['f', 'b', 'c'],
        prop3: {
          prop4: 'd',
          prop5: 'g',
        },
        prop6: 'asdf',
      };

      mergeYmlFile(unitTree, input);

      expect(load(unitTree.readText('/todo.yaml'))).toStrictEqual(expected);
    });
  });
});
