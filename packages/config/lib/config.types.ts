interface IClassType<T> {
  // tslint:disable-next-line: callable-types
  new (...args: any[]): T;
}

type ClassType<T> = IClassType<T>;

interface IConfigModuleOptions {
  configDir?: string;
  configPrefix?: string;
  configType?: ClassType<any>;
  validate?: () => boolean;
}

export type ConfigModuleOptions = IConfigModuleOptions;
