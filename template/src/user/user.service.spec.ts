import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './models/user.entity';
import { UserRepository } from './user.repository';
import { AuthService } from '../shared/auth/auth.service';
class MockAuthService {}

describe('UserService', () => {
  let service: UserService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      components: [
        {
          provide: getRepositoryToken(User),
          useClass: UserRepository,
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        UserService,
      ],
    }).compile();
    service = module.get<UserService>(UserService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
