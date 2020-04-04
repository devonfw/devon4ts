/* istanbul ignore file */
import { Config } from '../app/shared/model/config/config.model';

const def: Config = {
  isDev: false,
  host: 'localhost',
  port: 3000,
  clientUrl: 'localhost:4200',
  globalPrefix: 'v1',
  loggerConfig: {
    console: true,
    errorLogFile: './logs/error.log',
    generalLogFile: './logs/general.log',
    loggerLevel: 'info',
  },
};

export default def;
