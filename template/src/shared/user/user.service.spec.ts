import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { AuthServiceMock } from '../../../test/mocks/auth.service.mock';
import { AuthService } from '../auth/auth.service';
import { RegisterDTO } from '../auth/model/register.dto';
import { ChangePasswordDTO } from './models/dto/change-password.dto';
import { User } from './models/user.entity';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  const repo = new UserRepository();
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
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
        {
          provide: AuthService,
          useClass: AuthServiceMock,
        },
        UserService,
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const input: RegisterDTO = {
      mail: 'mail@mail.com',
      role: 'User',
      username: 'test',
      password: 'test',
    };
    it('should return an Error as input exists', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => new User());
      await service
        .register(input)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return the user', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => undefined);
      jest.spyOn(repo, 'create').mockImplementation(() => mocked);
      jest.spyOn(repo, 'save').mockImplementation(async () => {
        return mocked;
      });
      expect(await service.register(input)).toEqual(mocked);
    });
  });

  // TODO: Move this to auth.service.spec
  // describe('login', () => {
  //   const login: LoginDTO = {
  //     username: 'test',
  //     password: 'test',
  //   };
  //   it('should return error as user does not exist', async () => {
  //     jest.spyOn(repo, 'findOne').mockImplementation(async () => undefined);
  //     await service
  //       .login(login)
  //       .catch(error => expect(error).toBeInstanceOf(HttpException));
  //   });
  //   it('should return the User and token', async () => {
  //     jest
  //       .spyOn(service, 'passwordMatch')
  //       .mockImplementationOnce(async () => true);
  //     jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
  //     expect(await service.login(login)).toBeDefined();
  //   });
  //   it('should return an error as passwords do not match', async () => {
  //     jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
  //     login.password = 'otherpassword';
  //     await service
  //       .login(login)
  //       .catch(error => expect(error).toBeInstanceOf(HttpException));
  //   });
  // });

  describe('change password', () => {
    const input: ChangePasswordDTO = {
      username: 'test',
      password: 'testpassword',
      newPassword: 'test1password',
    };
    it('should return an error as user does not exist', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => undefined);
      await service
        .changePassword(input)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return an error as the passwords do not match', async () => {
      mocked.password = '!testpassword';
      jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
      jest
        .spyOn(service, 'passwordMatch')
        .mockImplementationOnce(async () => false);
      await service
        .changePassword(input)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return an error as the new password is equal to the previous one', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
      await service
        .changePassword(input)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return an error as the new password does not fit the criteria', async () => {
      jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
      input.newPassword = '12345';
      await service
        .changePassword(input)
        .catch(error => expect(error).toBeInstanceOf(HttpException));
    });
    it('should return the new user', async () => {
      input.newPassword = 'test1password';
      jest.spyOn(repo, 'findOne').mockImplementation(async () => mocked);
      jest
        .spyOn(service, 'passwordMatch')
        .mockImplementationOnce(async () => true);
      jest.spyOn(service, 'update').mockImplementation(async () => mocked);
      expect(await service.changePassword(input)).toEqual(mocked);
    });
  });

  describe('PasswordMatch', () => {
    it('Should return false', async () => {
      const password = await hash('!password', 10);
      expect(await service.passwordMatch('password', password)).toEqual(false);
    });
    it('Should return true', async () => {
      const password = await hash('password', 10);
      expect(await service.passwordMatch('password', password)).toEqual(true);
    });
  });
});
