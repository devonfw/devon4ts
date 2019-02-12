import { TodoParams, TodoLevel, Todo } from './models';
import { TodoRepository } from './todo.repository';
import { TodoService } from './todo.service';

describe('TodoService UnitTests', () => {
  let service: TodoService;
  let repo: TodoRepository;
  beforeEach(async () => {
    repo = new TodoRepository();
    service = new TodoService(repo);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createTodo', async () => {
    const input: TodoParams = {
      priority: TodoLevel.Low,
      description: 'description',
    };
    const saved: TodoParams = {
      priority: TodoLevel.Low,
      description: 'description',
    };
    jest.spyOn(repo, 'create').mockImplementation(() => saved as Todo);
    jest.spyOn(repo, 'save').mockImplementation(async () => saved as Todo);
    expect(await service.createTodo(input)).toEqual(saved);
  });
});
