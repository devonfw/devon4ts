import * as convict from 'convict';
import { existsSync } from 'fs';
import { AppConfig } from './app/shared/app-config';

const config: convict.Config<AppConfig> = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'develop', 'test', 'default'],
    default: 'default',
    env: 'NODE_ENV',
    nullable: false,
  },
  isDev: {
    doc: 'Is this a development environment?',
    format: Boolean,
    default: true,
    env: 'IS_DEV',
    nullable: false,
  },
  port: {
    doc: 'Application port',
    format: 'port',
    default: 3000,
    env: 'PORT',
    nullable: false,
  },
  defaultVersion: {
    doc: 'Application default version',
    format: String,
    default: '1',
    nullable: false,
  },
  logger: {
    loggerLevel: {
      doc: 'Minimum logger level that you want to show',
      format: ['info', 'warn', 'error', 'debug', 'verbose'],
      default: 'debug',
    },
    color: {
      doc: 'Do you want to show log messages with color?',
      format: Boolean,
      default: true,
    },
    oneLineStack: {
      doc: 'Do you want to show error stack traces in one line?',
      format: Boolean,
      default: false,
    },
  },
});

// Load environment dependent configuration
const env = config.get('env');
const fileName = `./config/${env}.json`;
if (env !== 'default' && existsSync(fileName)) {
  config.loadFile(fileName);
}

// Perform validation
config.validate({ allowed: 'strict' });

const APP_CONFIG: AppConfig = config.getProperties();

export default APP_CONFIG;
