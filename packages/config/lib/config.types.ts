interface IClassType<T> {
  // tslint:disable-next-line: callable-types
  new (...args: any[]): T;
}

type ClassType<T> = IClassType<T>;

interface IConfigModuleOptions {
  configDir?: string;
  configType?: ClassType<any>;
}

export type ConfigModuleOptions = IConfigModuleOptions;
