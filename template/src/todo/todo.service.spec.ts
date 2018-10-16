import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { TodoRepository } from './todo.repository';
import { Todo } from './models/todo.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('TodoService', () => {
  let service: TodoService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Todo),
          useClass: TodoRepository,
        },
        TodoService,
      ],
    }).compile();
    service = module.get<TodoService>(TodoService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
