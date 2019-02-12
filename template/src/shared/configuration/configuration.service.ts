import { Injectable } from '@nestjs/common';
import { Config, SwaggerConfig } from '../../../config/types';
import { get } from 'config';

@Injectable()
export class ConfigurationService implements Config {
  get(name: string): any {
    return process.env[name] || get(name);
  }

  get isDev(): boolean {
    return this.get('isDev');
  }

  get host(): string {
    return this.get('host');
  }

  get port(): number {
    return this.get('port');
  }

  get jwtKey(): string {
    return this.get('jwtKey');
  }

  get swaggerConfig(): SwaggerConfig {
    return this.get('swaggerConfig');
  }
}
