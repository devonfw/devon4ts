interface IConfigModuleOptions {
  configDir?: string;
  configPrefix?: string;
  configType?: Function;
  validate?: () => boolean;
}

export type ConfigModuleOptions = IConfigModuleOptions;
