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
    process.env['devon4node.isDev'] = 'false';
    process.env['devon4node.host'] = 'myhost';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join(__dirname, '../test/config'),
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({ ...config, isDev: false, host: 'myhost' });
  });

  it('should override values with the values provided by environment variables in nested objects', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'false';
    process.env['d4n.nested.value'] = 'becario';
    process.env['d4n.nested.host'] = 'anotherhost';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configPrefix: 'd4n',
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, value: 'becario', host: 'anotherhost' },
    });
  });

  it('should combine nested objects', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'no';
    process.env['d4n.nested'] = JSON.stringify({ value: 'becario', host: 'anotherhost' });
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configPrefix: 'd4n',
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, value: 'becario', host: 'anotherhost' },
    });
  });

  it('should validate the configuration', async () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'yes';
    process.env['d4n.nested.url'] = 'http://example.com';
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          configDir: join('./test/config'),
          configPrefix: 'd4n',
          configType: TestTypes,
        }),
      ],
    }).compile();

    const configService = module.get<ConfigService<BaseConfig>>(ConfigService);
    expect(configService.values).toStrictEqual({
      ...testConfig,
      nested: { ...testConfig.nested, url: 'http://example.com' },
    });
  });

  it('should validate the configuration and fail if there is any error', () => {
    process.env.NODE_ENV = 'test';
    process.env.VALIDATE_CONFIG = 'yes';

    return expect(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            configDir: join('./test/config'),
            configPrefix: 'new',
            configType: TestTypes,
          }),
        ],
      }).compile(),
    ).rejects.toThrowError();
  });
});
