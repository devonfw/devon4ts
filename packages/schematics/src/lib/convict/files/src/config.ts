import * as convict from 'convict';

const config = convict({
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
if (env !== 'default' && env !== 'test') {
  config.loadFile(`./config/${env}.json`);
}

// Perform validation
config.validate({ allowed: 'strict' });

// Infer type from convict
type GetConfigType<C> = C extends convict.Config<infer X> ? X : never;
export type AppConfig = GetConfigType<typeof config>;

const APP_CONFIG: AppConfig = config.getProperties();

export const CONFIG_PROVIDER = 'ConfigCustomProvider';

export default APP_CONFIG;
