export interface Config {
  isDev: boolean;
  host: string;
  port: number;
  jwtKey: string;
  swaggerConfig: SwaggerConfig;
}

export interface SwaggerConfig {
  title: string;
  description: string;
  version: string;
  basepath: string;
}
