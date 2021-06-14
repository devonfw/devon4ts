/* eslint-disable no-console */
import { Inject, Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import * as _ from 'lodash';
import { isAbsolute, join } from 'path';
import { CONFIG_OPTIONS_PROVIDER_NAME, CONFIG_VALUES_PROVIDER_NAME, CONFIG_SEPARATOR } from './config.constants';
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
    const valuesKeysUpper = Object.keys(this._values).map(e => e.toUpperCase());
    Object.keys(process.env)
      .filter(e => valuesKeysUpper.reduce((acc, current) => e.startsWith(current) || acc, false) && process.env[e])
      // 0 is not possible as it is impossible to have two environment variables with the same name
      .sort((a, b) => (a > b ? 1 : -1))
      .forEach(e => {
        const key = this.getKeyFromEnvVarName(e);
        if (key) {
          const actualValue = _.get(this._values, key);
          this.parseValue(e, actualValue, key);
        }
      });
  }

  private getKeyFromEnvVarName(envVar: string): string | undefined {
    const parts = envVar.split(CONFIG_SEPARATOR);
    let key: string | undefined = undefined;
    let valuesKeys = Object.keys(this._values);

    while (parts.length) {
      const part = parts.shift();
      const keyPart = valuesKeys.find(value => value.toUpperCase() === part);
      if (!keyPart) {
        if (key) {
          return key + '.' + part!.toLowerCase();
        }
        return undefined;
      }

      if (key) {
        key += '.' + keyPart;
      } else {
        key = keyPart;
      }

      valuesKeys = Object.keys(_.get(this._values, key));
    }

    return key;
  }

  private parseValue(envVarName: string, actualValue: any, key: string): void {
    let newValue: any = process.env[envVarName]!;

    try {
      newValue = JSON.parse(process.env[envVarName]!);
    } catch {
      // nothing to do
    }

    if (!_.isPlainObject(newValue) || !_.isPlainObject(actualValue)) {
      _.set(this._values as any, key, newValue);
    } else {
      _.set(this._values as any, key, _.defaultsDeep(newValue, actualValue));
    }
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
