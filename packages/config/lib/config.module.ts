import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModuleOptions } from '~lib/config.types';
import { CONFIG_OPTIONS_PROVIDER_NAME, CONFIG_VALUES_PROVIDER_NAME } from '~lib/config.constants';
import { ConfigService } from '~lib/config.service';
import { BaseConfig } from '~lib/base-config';

@Module({})
export class ConfigModule {
  private static defaultOptions: Partial<ConfigModuleOptions> = {
    configDir: './dist/config',
    configPrefix: 'devon4node',
    validate: ConfigModule.getValidate,
    configType: BaseConfig,
  };

  private static getValidate(): boolean {
    return !process.env.VALIDATE_CONFIG ||
      process.env.VALIDATE_CONFIG.toLowerCase() === 'false' ||
      process.env.VALIDATE_CONFIG.toLowerCase() === 'no'
      ? false
      : true;
  }

  static forRoot(options?: Omit<Partial<ConfigModuleOptions>, 'validate'>): DynamicModule {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return {
      module: ConfigModule,
      providers: [
        {
          provide: CONFIG_OPTIONS_PROVIDER_NAME,
          useValue: mergedOptions,
        },
        {
          provide: CONFIG_VALUES_PROVIDER_NAME,
          useFactory: async (): Promise<any> => {
            return await ConfigService.loadConfigFromFile(mergedOptions.configDir!);
          },
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
