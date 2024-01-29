export interface AppConfig {
  env: string;
  isDev: boolean;
  port: number;
  defaultVersion: string;
  logger: {
    loggerLevel: string;
    color: boolean;
    oneLineStack: boolean;
  };
}
