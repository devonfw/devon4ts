import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserServiceMock } from '../../../test/mocks/user.service.mock';
import { RegisterVm } from './models/view-models/register-vm.model';
import { HttpException } from '@nestjs/common';
import { LoginVm } from './models/view-models/login-vm.model';

describe('User Controller', () => {
  let module: TestingModule;
  let controller: UserController;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useClass: UserServiceMock }],
    }).compile();
  });
  it('should be defined', () => {
    controller = module.get<UserController>(UserController);
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('Should return a new User', async () => {
      const input: RegisterVm = {
        username: 'test',
        password: 'test',
        mail: 'mail@test.com',
        role: 'User',
      };
      const result = await controller.register(input);
      expect(result.username).toEqual(input.username);
      expect(result.mail).toEqual(input.mail);
      expect(result.role).toEqual(input.role);
    });
    it('Should return a new User with username and mail to lower', async () => {
      const input: RegisterVm = {
        username: 'tEst',
        password: 'test',
        mail: 'Mail@test.com',
        role: 'User',
      };
      const result = await controller.register(input);
      expect(result.username).toEqual(input.username.toLowerCase());
      expect(result.mail).toEqual(input.mail.toLocaleLowerCase());
    });
    it('Should throw a missing username HttpException', async () => {
      const input: RegisterVm = {
        username: '',
        password: 'test',
        mail: 'Mail@test.com',
        role: 'User',
      };
      await controller.register(input).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message.message).toContain('username');
      });
    });
    it('Should throw a missing password HttpException', async () => {
      const input: RegisterVm = {
        username: 'test',
        password: '',
        mail: 'Mail@test.com',
        role: 'User',
      };
      await controller.register(input).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message.message).toContain('password');
      });
    });
    it('Should throw a missing mail HttpException', async () => {
      const input: RegisterVm = {
        username: 'test',
        password: 'test',
        mail: '',
        role: 'User',
      };
      await controller.register(input).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message.message).toContain('mail');
      });
    });
  });
  describe('login', () => {
    it('Should return a LoginResponse with a token', async () => {
      const input: LoginVm = {
        username: 'test',
        password: 'test',
      };
      const result = await controller.login(input);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.token).toEqual('LoginToken');
      expect(result.user.mail).toEqual('mail@test.com');
      expect(result.user.username).toEqual(input.username);
    });
  });
});
