import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';

class MockTodoService {}
describe('Todo Controller', () => {
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [{ provide: TodoService, useClass: MockTodoService }],
    }).compile();
  });
  it('should be defined', () => {
    const controller: TodoController = module.get<TodoController>(
      TodoController,
    );
    expect(controller).toBeDefined();
  });
});
