import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import config from '../test/config/default';
import productionConfig from '../test/config/production';
import testConfig from '../test/config/test';
import { TestTypes } from '../test/test.types';
import { BaseConfig } from './base-config';
import { ConfigModule } from './config.module';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  it('should return the values of default config file if NODE_ENV is not present', async () => {
    process.env.NODE_ENV = '';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join(__dirname, '../test/config'),
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual(config);
  });

  it('should return the values of production config file if NODE_ENV is equal to production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.VALIDATE_CONFIG = 'no';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join(__dirname, '../test/config'),
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual(productionConfig);
  });

  it('should override values with the values provided by environment variables', async () => {
    process.env.NODE_ENV = '';
    process.env.VALIDATE_CONFIG = 'false';
    process.env['ISDEV'] = 'false';
    process.env['HOST'] = 'myhost';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join(__dirname, '../test/config'),
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({ ...config, isDev: false, host: 'myhost' });
    process.env['ISDEV'] = '';
    process.env['HOST'] = '';
  });

  it('should override values with the values provided by environment variables in nested objects', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'false';
    process.env['NESTED_VALUE'] = 'becario';
    process.env['NESTED_HOST'] = 'anotherhost';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    // eslint-disable-next-line no-console
    console.log(configService.values);
    // eslint-disable-next-line no-console
    console.log({
      ...testConfig,
      nested: { ...testConfig.nested, value: 'becario', host: 'anotherhost' },
    });
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, value: 'becario', host: 'anotherhost' },
    });
    process.env['NESTED_VALUE'] = '';
    process.env['NESTED_HOST'] = '';
  });

  it('should combine nested objects', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'no';
    process.env['NESTED'] = JSON.stringify({ value: 'becario', host: 'anotherhost' });
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, value: 'becario', host: 'anotherhost' },
    });
    process.env['NESTED'] = '';
  });

  it('should validate the configuration', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'yes';
    process.env['NESTED_URL'] = 'http://example.com';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, url: 'http://example.com' },
    });
    process.env['NESTED_URL'] = '';
  });

  it('should validate the configuration and fail if there is any error', () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'yes';
    process.env.ISDEV = '1';

    return expect(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            configDir: join('./test/config'),
            configType: TestTypes,
          }),
        ],
      }).compile(),
    ).rejects.toThrowError();
  });
});
