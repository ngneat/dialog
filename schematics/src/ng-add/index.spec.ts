import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const angularJSON = {
  projects: {
    test: {
      sourceRoot: 'src',
      architect: {
        build: {
          options: {
            main: 'src/main.ts'
          }
        }
      }
    }
  },
  defaultProject: 'test'
};
const appModule = `
  import { NgModule } from '@angular/core';

  @NgModule({declarations: [], imports: [], bootstrap: [], })
  export class AppModule { }
`;
const main = `
  import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
  import { AppModule } from './app/app.module';

  platformBrowserDynamic().bootstrapModule(AppModule);
`;

const collectionPath = join(__dirname, '../collection.json');

function updateAppModuleSnapshot(content: string) {
  writeFileSync(join(__dirname, 'app.module.ts.snap'), content);
}

describe('Schematics', () => {
  let testTree: Tree;
  let runner: SchematicTestRunner;

  beforeEach(() => {
    testTree = Tree.empty();
    testTree.create('./angular.json', JSON.stringify(angularJSON));
    testTree.create('./package.json', JSON.stringify({ dependencies: {} }));
    testTree.create('./src/main.ts', main);
    testTree.create('./src/app/app.module.ts', appModule);

    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  describe('ng-add', () => {
    it('should add package to package.json and import it in app.module', async () => {
      const tree = await runner.runSchematicAsync('ng-add', {}, testTree).toPromise();

      const appModuleModified = tree.readContent('./src/app/app.module.ts');

      // updateAppModuleSnapshot(appModuleModified);

      const expectedAppModule = readFileSync(join(__dirname, 'app.module.ts.snap')).toString();

      expect(appModuleModified).toContain(expectedAppModule);

      const packageJSONModified = JSON.parse(tree.readContent('./package.json'));

      expect(packageJSONModified).toEqual({
        dependencies: {
          '@ngneat/dialog': '1.0.0'
        }
      });
    });
  });
});
