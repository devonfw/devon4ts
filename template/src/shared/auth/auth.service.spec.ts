import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../../user/user.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { JwtPayload } from './jwt-payload';
import { UserRepository } from '../../user/user.repository';
import { sign } from 'jsonwebtoken';
import { User } from '../../user/models/user.entity';
jest.mock('../../user/user.service');
describe('AuthService', () => {
  let service: AuthService;
  let user: any;
  let payload: JwtPayload;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, AuthService, ConfigurationService],
    }).compile();
    service = module.get<AuthService>(AuthService);
    user = {
      username: 'tester',
      mail: 'tester',
      password: 'superpasword',
      role: 'User',
    };
    payload = {
      username: user.username,
      role: user.role,
    };
  });
  it('service should be defined', () => {
    expect(service).toBeDefined();
  });
  it('user should be defined', () => {
    expect(user).toBeDefined();
  });
  it('payload should be defined', () => {
    expect(payload).toBeDefined();
  });
  it('payload signature failed', () => {
    expect(sign(payload, 'superkey')).toBeDefined();
  });
});
