import { HttpException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigurationService } from '../configuration/configuration.service';
import { User } from '../user/models/user.entity';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './model/login.dto';
import { JwtStrategy } from './strategies/jwt.strategy';

jest.mock('../user/user.service');
describe('AuthService', () => {
  let service: AuthService;
  let repo: UserRepository;
  const mocked: User = {
    id: 1,
    username: 'test',
    mail: 'test@mail.com',
    password: 'test',
    role: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    hasId: () => true,
    save: () => new Promise<User>(resolve => resolve(undefined)),
    remove: () => new Promise<User>(resolve => resolve(undefined)),
    reload: () =>
      new Promise<void>(() => {
        // nothing to do here
      }),
  };

  beforeAll(async done => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secretOrPrivateKey: 'key' })],
      providers: [AuthService, JwtStrategy, UserService, ConfigurationService],
    }).compile();
    service = module.get<AuthService>(AuthService);
    repo = new UserRepository();
    done();
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const login: LoginDTO = {
      username: 'test',
      password: 'test',
    };
    it('Should return a LoginResponse with a token', async () => {
      const input: LoginDTO = {
        username: 'test',
        password: 'test',
      };
      jest
        .spyOn(service, 'validateLogin')
        .mockImplementation(
          () => new Promise<User>(resolve => resolve(mocked)),
        );
      const result = await service.login(input);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.mail).toEqual('test@mail.com');
      expect(result.user.username).toEqual(input.username);
    });
    it('should return error as user does not exist', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => undefined);
      await service
        .login(login)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return an error as passwords do not match', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
      login.password = 'otherpassword';
      await service
        .login(login)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
  });
});
