import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';

describe('Order Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [OrderController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: OrderController = module.get<OrderController>(OrderController);
    expect(controller).toBeDefined();
  });
});
