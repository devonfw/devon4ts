export const databaseConvictOptions: Record<string, string> = {
  mysql: `${printType('mysql')}
    ${printHost('localhost')}
    ${printPort(3306)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  mariadb: `${printType('mariadb')}
    ${printHost('localhost')}
    ${printPort(3306)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  sqlite: `${printType('sqlite')} ${printDatabase(':memory:')}`,
  postgres: `${printType('postgres')}
    ${printHost('localhost')}
    ${printPort(5432)}
    ${printUsername('test')}
    ${printPassword('test')}
    ${printDatabase('test')}`,
  cockroachdb: `${printType('cockroachdb')}
    ${printHost('localhost')}
    ${printPort(2625)}
    ${printUsername('root')}
    ${printPassword('')}
    ${printDatabase('defaultdb')}`,
  mssql: `${printType('mssql')}
    ${printHost('localhost')}
    ${printUsername('sa')}
    ${printPassword('Admin12345')}
    ${printDatabase('tempdb')}`,
  oracle: `${printType('oracle')}
    ${printHost('localhost')}
    ${printPort(1521)}
    ${printUsername('system')}
    ${printPassword('oracle')}
    ${printSID('xe.oracle.docker')}`,
  mongodb: `${printType('mongodb')} ${printDatabase('test')}`,
};

export const defaultDatabaseConvictOptions = `synchronize: {
    doc: 'Do you want to synchronize database tables with you entities?',
    default: false,
    format: Boolean,
  },
  migrationsRun: {
    doc: 'Do you want to execute the migrations at application start?',
    default: true,
    format: Boolean,
  },
  logging: { doc: 'Do you want to log all database queries?', default: true, format: Boolean }`;

export const databaseConvictTypes: Record<string, string> = {
  mysql: `type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;`,
  mariadb: `type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;`,
  sqlite: `type: string; database: string;`,
  postgres: `type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;`,
  cockroachdb: `type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;`,
  mssql: `type: string;
    host: string;
    username: string;
    password: string;
    database: string;`,
  oracle: `type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    sid: string;`,
  mongodb: `type: string; database: string;`,
};

function printType(type: string): string {
  return `type: {
    doc: 'Database provider type',
    default: '${type}',
    format: ['postgres', 'cockroachdb', 'mariadb', 'mysql', 'sqlite', 'oracle', 'mssql', 'mongodb'],
    env: 'DATABASE_TYPE',
    arg: 'databaseType',
  },`;
}

function printHost(host: string): string {
  return `host: {
    doc: 'Database host URL',
    default: '${host}',
    format: String,
    env: 'DATABASE_HOST',
    arg: 'databaseHost',
  },`;
}

function printPort(port: number): string {
  return `port: {
    doc: 'Database port',
    default: ${port},
    format: 'port',
    env: 'DATABASE_PORT',
    arg: 'databasePort',
  },`;
}

function printUsername(username: string): string {
  return `username: {
    doc: 'Database connection username',
    default: '${username}',
    format: String,
    env: 'DATABASE_USERNAME',
    arg: 'databaseUsername',
  },`;
}

function printPassword(password: string): string {
  return `password: {
    doc: 'Database connection password',
    default: '${password}',
    format: String,
    secret: true,
    env: 'DATABASE_PASSWORD',
    arg: 'databasePassword',
  },`;
}

function printDatabase(database: string): string {
  return `database: {
    doc: 'Database connection schema',
    default: '${database}',
    format: String,
    env: 'DATABASE_DATABASE',
    arg: 'databaseDatabase',
  },`;
}

function printSID(sid: string): string {
  return `sid: {
    doc: 'Database connection SID',
    default: '${sid}',
    format: String,
    env: 'DATABASE_SID',
    arg: 'databaseSid',
  },`;
}
