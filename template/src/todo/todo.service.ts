import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo, TodoLevel, TodoParams } from './models';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly _todoRepository: Repository<Todo>,
  ) {}

  async createTodo(params: TodoParams): Promise<Todo> {
    try {
      if (params.priority) {
        if (
          Object.keys(TodoLevel).filter(value => {
            return value === params.priority;
          }).length === 0
        ) {
          params.priority = TodoLevel.Normal;
        }
      }
      const newTodo = await this._todoRepository.create(params);
      return await this._todoRepository.save(newTodo);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(filter = {}) {
    return await this._todoRepository.find(filter);
  }

  async findById(id: any) {
    return await this._todoRepository.findOne(id);
  }

  async delete(item: Todo) {
    const exists = await this._todoRepository.findOne(item);
    if (exists) {
      return await this._todoRepository.remove(item);
    }
    return exists;
  }

  async deleteById(id: any) {
    const exists = await this._todoRepository.findOne(id);
    if (exists) {
      return await this._todoRepository.remove(exists);
    }
    return exists;
  }

  async update(id: any, item: Partial<Todo>) {
    const exists = await this._todoRepository.findOne(id);
    if (exists) {
      await this._todoRepository.update(id, item);
    }
    return exists;
  }
}
