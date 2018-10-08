import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Todo } from './models/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityRepository } from 'typeorm';
import { BaseService } from 'shared/base.service';
import { TodoParams } from './models/view-models/todo-params.model';
import { TodoLevel } from './models/todo-level.enum';
@Injectable()
@EntityRepository(Todo)
export class TodoService extends BaseService<Todo> {
  constructor(
    @InjectRepository(Todo) private readonly _todoRepository: Repository<Todo>,
  ) {
    super();
    this._repository = _todoRepository;
  }

  async createTodo(params: TodoParams): Promise<Todo> {
    try {
      if (params.priority) {
        if (!Object.values(TodoLevel).includes(params.priority)) {
          params.priority = TodoLevel.Normal;
        }
      }
      const newTodo = await this._todoRepository.create(params);
      return await this._todoRepository.save(newTodo);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
