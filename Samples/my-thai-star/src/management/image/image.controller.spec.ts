import { Test, TestingModule } from '@nestjs/testing';
import { ImageController } from './image.controller';

describe('Image Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [ImageController],
    }).compile();
  });
  it('should be defined', () => {
    const controller: ImageController = module.get<ImageController>(ImageController);
    expect(controller).toBeDefined();
  });
});
