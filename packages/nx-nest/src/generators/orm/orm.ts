import { formatFiles, installPackagesTask, output, readProjectConfiguration, Tree } from '@nx/devkit';
import { mergeDockerCompose } from '../../utils/merge';
import { ensureProjectIsAnApplication } from '../../utils/tree-utils';
import { dbType, InitTypeormGeneratorSchema } from './schema';
import { generateTypeormConfiguration } from './typeorm';

const compose: Record<dbType, string> = {
  mysql: `version: '3'
services:
  mysql:
    image: "mysql:8.0.30"
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: "admin"
      MYSQL_USER: "test"
      MYSQL_PASSWORD: "test"
      MYSQL_DATABASE: "test"
`,
  mariadb: `version: '3'
services:
  mariadb:
    image: "mariadb:10.8.4"
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: "admin"
      MYSQL_USER: "test"
      MYSQL_PASSWORD: "test"
      MYSQL_DATABASE: "test"
`,
  postgres: `version: '3'
services:
  postgres:
    image: "postgres:14.5"
    ports:
    - "5432:5432"
    environment:
      POSTGRES_USER: "test"
      POSTGRES_PASSWORD: "test"
      POSTGRES_DB: "test"
`,
  cockroachdb: `version: '3'
services:
  cockroachdb:
    image: "cockroachdb/cockroach:v22.1.6"
    command: start --insecure
    ports:
      - "26257:26257"
`,
  sqlite: `version: '3'
services:
`,
  oracle: '',
  mssql: `version: '3'
services:
  mssql:
    image: "microsoft/mssql-server-linux:rc2"
    ports:
      - "1433:1433"
    environment:
      SA_PASSWORD: "Admin12345"
      ACCEPT_EULA: "Y"
`,
  mongodb: `version: '3'
services:
  mongodb:
    image: "mongo:5.0.12"
    container_name: "typeorm-mongodb"
    ports:
      - "27017:27017"
`,
};

export async function initOrmGenerator(tree: Tree, options: InitTypeormGeneratorSchema): Promise<() => void> {
  const appConfig = readProjectConfiguration(tree, options.projectName);
  const projectRoot = appConfig.root;

  ensureProjectIsAnApplication(appConfig);

  if (options.orm === 'typeorm') {
    generateTypeormConfiguration(tree, options, projectRoot);
  } else {
    output.error({ title: `ORM ${options.orm} not implemented yet` });
  }
  mergeDockerCompose(tree, compose[options.db]);

  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}

export default initOrmGenerator;
