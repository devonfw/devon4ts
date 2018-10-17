import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { TodoVm } from './models/view-models/todo-vm.model';
import { TodoParams } from './models/view-models/todo-params.model';
import { TodoLevel } from './models/todo-level.enum';
import { TodoRepository } from './todo.repository';
import { HttpException } from '@nestjs/common';

describe('Todo Controller', () => {
  let controller: TodoController;
  let service: TodoService;
  let repo: TodoRepository;
  beforeEach(async () => {
    repo = new TodoRepository();
    service = new TodoService(repo);
    controller = new TodoController(service);
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getTodos', async () => {
    const result: TodoVm[] = [
      {
        description: 'Todo created',
        priority: TodoLevel.Normal,
        completed: false,
      },
    ];
    jest.spyOn(service, 'findAll').mockImplementation(() => result);
    expect(await controller.getTodos()).toEqual(result);
  });

  it('Creating Todo', async () => {
    const result: TodoVm = {
      description: 'Todo created',
      priority: TodoLevel.Normal,
      completed: false,
    };
    let input: TodoParams = {
      description: 'Todo created',
    };
    jest.spyOn(service, 'createTodo').mockImplementation(() => result);
    expect(await controller.create(input)).toEqual(result);
    input = { description: '   ' };
    await controller
      .create(input)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
    await controller
      .create(null)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
  });

  it('Updating Todo', async () => {
    const updated: TodoVm = {
      id: 1,
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    const result: TodoVm = {
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    let input: TodoVm = {
      id: 1,
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    jest.spyOn(service, 'update').mockImplementation(() => updated);
    expect(await controller.update(input)).toEqual(result);
    input = {
      priority: TodoLevel.Normal,
      description: 'Todo updated',
      completed: false,
    };
    await controller
      .update(input)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
    await controller
      .update(null)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
  });

  it('Deleting Todo', async () => {
    const deleted: TodoVm = {
      id: 1,
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    const result: TodoVm = {
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    const input: TodoVm = {
      id: 1,
      description: 'Todo updated',
      priority: TodoLevel.Normal,
      completed: false,
    };
    jest.spyOn(service, 'findById').mockImplementation(() => deleted);
    jest.spyOn(service, 'deleteById').mockImplementation(() => deleted);
    expect(await controller.delete(input.id)).toEqual(result);
    jest.spyOn(service, 'findById').mockImplementation(() => null);
    await controller
      .delete(0)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
    await controller
      .delete(null)
      .catch(error => expect(error).toBeInstanceOf(HttpException));
  });
});
