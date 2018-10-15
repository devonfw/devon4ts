import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/user.service';
import { ConfigurationService } from '../configuration/configuration.service';

class MockUserService {}
describe('AuthService', () => {
  let service: AuthService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      components: [
        {
          provide: UserService,
          useClass: MockUserService,
        },
        AuthService,
        ConfigurationService,
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
