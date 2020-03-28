import { Inject, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as _ from 'lodash';
import { isAbsolute, join } from 'path';
import { CONFIG_OPTIONS_PROVIDER_NAME, CONFIG_VALUES_PROVIDER_NAME, PREFIX_SEPARATOR } from './config.constants';
import { ConfigModuleOptions } from './config.types';

@Injectable()
export class ConfigService<T> {
  // load the NODE_ENV value when calling instead of when import the file
  private static configFile: () => string = () => process.env.NODE_ENV || 'default';

  constructor(
    @Inject(CONFIG_OPTIONS_PROVIDER_NAME) private readonly configModuleOptions: ConfigModuleOptions,
    @Inject(CONFIG_VALUES_PROVIDER_NAME) private _values: T,
  ) {
    this.loadConfig();
    if (configModuleOptions.validate!()) {
      this.validateValues();
    }
  }

  static async loadConfigFromFile(configDir: string): Promise<any> {
    let filePath = join(configDir || process.cwd(), ConfigService.configFile());
    if (!isAbsolute(filePath)) {
      filePath = join(process.cwd(), filePath);
    }
    const config = await import(filePath);
    return { ...config.default };
  }

  private loadConfig(): void {
    Object.keys(process.env)
      .filter(e => e.startsWith(this.configModuleOptions.configPrefix! + PREFIX_SEPARATOR) && process.env[e])
      .forEach(e => {
        const key = this.removePrefix(e);
        let newValue: any = process.env[e]!;
        const actualValue = _.get(this._values, key);

        try {
          newValue = JSON.parse(process.env[e]!);
        } catch {
          // nothing to do
        }

        if (!_.isPlainObject(newValue) || !_.isPlainObject(actualValue)) {
          _.set(this._values as any, key, newValue);
        } else {
          _.set(this._values as any, key, _.defaultsDeep(newValue, actualValue));
        }
      });
  }

  private removePrefix(key: string): string {
    return key.substr(this.configModuleOptions.configPrefix!.length + PREFIX_SEPARATOR.length);
  }

  private validateValues(): void {
    const validationErrors = validateSync(plainToClass(this.configModuleOptions.configType as any, this._values));
    if (validationErrors.length) {
      throw new Error(JSON.stringify(validationErrors));
    }
  }

  get values(): T {
    return this._values;
  }
}
