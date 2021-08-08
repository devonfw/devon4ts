import { Test, TestingModule } from '@nestjs/testing';
import { MAILER_OPTIONS_PROVIDER_NAME, MAILER_TRANSPORT_PROVIDER_NAME } from './mailer.constants';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: MAILER_TRANSPORT_PROVIDER_NAME,
          useValue: {},
        },
        {
          provide: MAILER_OPTIONS_PROVIDER_NAME,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
