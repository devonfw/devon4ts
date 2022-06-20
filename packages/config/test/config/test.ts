import { TestTypes } from '../../test/test.types';

const config: TestTypes = {
  isDev: true,
  port: 3000,
  host: 'localhost',
  clientUrl: 'localhost:4200',
  defaultVersion: '1',
  nested: {
    value: '123',
    type: 'oracle',
    url: 'myurl',
  },
};

export default config;
