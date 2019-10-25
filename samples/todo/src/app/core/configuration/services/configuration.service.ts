import { Injectable } from '@nestjs/common';
import { IConfig, ISwaggerConfig } from '../model';
import { join } from 'path';

// Put the correct value of config dir before load the config package
process.env.NODE_CONFIG_DIR = join(__dirname, '../../../../config/');
import { getConfigProperty } from '@devon4node/common';
import { ConnectionOptions } from 'typeorm';
import { JwtModuleOptions } from '@nestjs/jwt';

@Injectable()
export class ConfigurationService implements IConfig {
  get(name: string): any {
    return getConfigProperty(name);
  }

  get isDev(): boolean {
    return !!this.get('isDev')!;
  }

  get host(): string {
    return this.get('host')!;
  }

  get port(): number {
    return Number(this.get('port')!);
  }

  get clientUrl(): string {
    return this.get('clientUrl')!;
  }

  get globalPrefix(): string {
    return this.get('globalPrefix')!;
  }

  get database(): ConnectionOptions {
    return { ...this.get('database')! } as ConnectionOptions;
  }

  get swaggerConfig(): ISwaggerConfig {
    return { ...this.get('swaggerConfig')! } as ISwaggerConfig;
  }

  get jwtConfig(): JwtModuleOptions {
    return { ...this.get('jwtConfig')! } as JwtModuleOptions;
  }
}
