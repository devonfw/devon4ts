import { BaseConfig } from '~lib/base-config';

const config: BaseConfig = {
  isDev: false,
  port: 3000,
  host: 'productionhost',
  clientUrl: 'productionhost:4200',
  globalPrefix: 'v1',
};

export default config;
