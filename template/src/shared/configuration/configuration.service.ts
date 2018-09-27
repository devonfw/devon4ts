import { Injectable } from '@nestjs/common';
import { Configuration } from './configuration.enum';
import { get } from 'config';

@Injectable()
export class ConfigurationService {
  static connectionString: string =
    process.env[Configuration.DB_URI] || get(Configuration.DB_URI);
  private enviromentHosting: string = process.env.NODE_ENV || 'development';

  get(name: string) {
    return process.env[name] || get(name);
  }

  get isDevelopment(): boolean {
    return this.enviromentHosting === 'development';
  }
}
