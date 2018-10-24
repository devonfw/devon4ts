import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';

describe('Booking Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [BookingController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: BookingController = module.get<BookingController>(BookingController);
    expect(controller).toBeDefined();
  });
});
