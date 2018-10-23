import { Test, TestingModule } from '@nestjs/testing';
import { DishController } from './dish.controller';

describe('Dish Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [DishController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: DishController = module.get<DishController>(DishController);
    expect(controller).toBeDefined();
  });
});
