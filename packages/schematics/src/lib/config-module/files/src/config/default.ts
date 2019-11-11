/* istanbul ignore file */
import { IConfig } from '../app/core/configuration/model';

const def: IConfig = {
  isDev: true,
  host: 'localhost',
  port: 3000,
  clientUrl: 'localhost:4200',
  globalPrefix: 'v1',
};

export default def;
