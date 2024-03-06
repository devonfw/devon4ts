type dbType = 'postgres' | 'cockroachdb' | 'mariadb' | 'mysql' | 'sqlite' | 'oracle' | 'mssql' | 'mongodb';

export interface InitTypeormGeneratorSchema {
  orm: 'typeorm' | 'prisma' | 'drizzle';
  projectName: string;
  db: dbType;
}
