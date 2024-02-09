import 'reflect-metadata';
import { DataSource } from 'typeorm';<% if (config) { %>
import config from '../../../config';<% } %>

export const AppDataSource = new DataSource({
  <% if (config) { %>
    ...config.database,
    type: '<%=db%>',<% } else { %>
    type: '<%=db%>',<% if (db === 'mysql') { %>
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test',<% } %><% if (db === 'mariadb') { %>
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test',<% } %><% if (db === 'sqlite') { %>
    database: ':memory:',<% } %><% if (db === 'postgres') { %>
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test',<% } %><% if (db === 'cockroachdb') { %>
    host: 'localhost',
    port: 26257,
    username: 'root',
    password: '',
    database: 'defaultdb',<% } %><% if (db === 'mssql') { %>
    host: 'localhost',
    username: 'sa',
    password: 'Admin12345',
    database: 'tempdb',<% } %><% if (db === 'oracle') { %>
    host: 'localhost',
    port: 1521,
    username: 'system',
    password: 'oracle',
    sid: 'xe.oracle.docker',<% } %><% if (db === 'mongodb') { %>
    database: 'test', <% } %><% } %>
  entities: [],
  migrations: [],
  subscribers: [],
});
