import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceMock } from '../../../test/mocks/user.service.mock';
import { UserDTO } from './models/dto/user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

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

  describe('update', () => {
    it('Should return an error because no id', async () => {
      const input: UserDTO = { username: 'test', mail: 'mail@test.com' };
      await controller.update(input).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
      });
    });
    it('Should return an error because no user found', async () => {
      const input: UserDTO = { id: 2, username: 'test', mail: 'mail@test.com' };
      await controller.update(input).catch(error => {
        expect(error).toBeInstanceOf(HttpException);
      });
    });
    it('Should return an updated User (does not update the username)', async () => {
      const input: UserDTO = {
        id: 1,
        username: 'updated',
        mail: 'updated@test.com',
      };
      const result = await controller.update(input);
      expect(result.username).toEqual('test');
      expect(result.mail).toEqual(input.mail);
    });
  });
});
