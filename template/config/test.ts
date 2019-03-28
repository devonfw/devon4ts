import { Config } from './types';
const test: Config = {
  isDev: false,
  host: 'localhost',
  port: 8080,
  jwtKey: 'key',
  swaggerConfig: {
    title: 'Your App Title',
    description: 'API Documentation',
    version: '0.0.1',
    basepath: 'api',
  },
};

export default test;
