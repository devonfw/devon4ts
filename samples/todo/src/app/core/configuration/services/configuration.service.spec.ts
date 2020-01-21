import def from '../../../../config/test';
process.env.NODE_ENV = 'test';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  const configService: ConfigurationService = new ConfigurationService();

  it('should return the values of test config file', () => {
    expect(configService.isDev).toStrictEqual(def.isDev);
    expect(configService.host).toStrictEqual(def.host);
    expect(configService.port).toStrictEqual(def.port);
    expect(configService.clientUrl).toStrictEqual(def.clientUrl);
    expect(configService.globalPrefix).toStrictEqual(def.globalPrefix);
    // Remove comments if you add those modules
    // expect(configService.database).toStrictEqual(def.database);
    // expect(configService.swaggerConfig).toStrictEqual(def.swaggerConfig);
    // expect(configService.jwtConfig).toStrictEqual(def.jwtConfig);
    // expect(configService.mailerConfig).toStrictEqual(def.mailerConfig);
  });
  it('should take the value of environment varible if defined', () => {
    process.env.isDev = 'true';
    process.env.host = 'notlocalhost';
    process.env.port = '123456';
    process.env.clientUrl = 'http://theclienturl.net';
    process.env.globalPrefix = 'v2';
    // process.env.swaggerConfig = JSON.stringify({
    //   swaggerTitle: 'Test Application',
    // });
    // process.env.database = JSON.stringify({
    //   type: 'oracle',
    //   cli: { entitiesDir: 'src/notentitiesdir' },
    // });
    // process.env.jwtConfig = JSON.stringify({ secret: 'NOTSECRET' });
    // process.env.mailerConfig = JSON.stringify({ mailOptions: { host: 'notlocalhost' }});

    expect(configService.isDev).toBe(true);
    expect(configService.host).toBe('notlocalhost');
    expect(configService.port).toBe(123456);
    expect(configService.clientUrl).toBe('http://theclienturl.net');
    expect(configService.globalPrefix).toBe('v2');
    // const database: any = { ...def.database, type: 'oracle' };
    // database.cli.entitiesDir = 'src/notentitiesdir';
    // expect(configService.database).toStrictEqual(database);
    // expect(configService.swaggerConfig).toStrictEqual({
    //   ...def.swaggerConfig,
    //   swaggerTitle: 'Test Application',
    // });
    // expect(configService.jwtConfig).toStrictEqual({
    //   ...def.jwtConfig,
    //   secret: 'NOTSECRET',
    // });
    // const mail: any = { ...def.mailerConfig };
    // mail.mailOptions.host = 'notlocalhost';
    // expect(configService.mailerConfig).toStrictEqual(mail);

    process.env.isDev = undefined;
    process.env.host = undefined;
    process.env.port = undefined;
    process.env.clientUrl = undefined;
    process.env.globalPrefix = undefined;
    // process.env.database = undefined;
    // process.env.swaggerConfig = undefined;
    // process.env.jwtConfig = undefined;
    // process.env.mailerConfig = undefined;
  });
});
