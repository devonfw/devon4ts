import { TodoService } from './todo.service';
import { TodoRepository } from './todo.repository';
import { TodoParams } from './models/view-models/todo-params.model';
import { TodoLevel } from './models/todo-level.enum';

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
    jest.spyOn(repo, 'create').mockImplementation(() => saved);
    jest.spyOn(repo, 'save').mockImplementation(() => saved);
    expect(await service.createTodo(input)).toEqual(saved);
  });
});
