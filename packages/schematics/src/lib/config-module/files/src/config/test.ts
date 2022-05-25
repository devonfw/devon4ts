/* istanbul ignore file */
import { PartialDeep } from 'type-fest';
import { Config } from '../app/shared/model/config/config.model';

const def: PartialDeep<Config> = {
  isDev: true,
  host: 'localhost',
  port: 3000,
  clientUrl: 'localhost:4200',
  defaultVersion: '1',
  loggerConfig: {
    console: false,
    loggerLevel: 'info',
  },
};

export default def;
