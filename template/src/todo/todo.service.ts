import { Injectable } from '@nestjs/common';
import { Todo } from './models/todo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityRepository, DeepPartial } from 'typeorm';
import { MapperService } from 'shared/mapper/mapper.service';

@Injectable()
@EntityRepository(Todo)
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly _todoRepository: Repository<Todo>,
    private readonly _mapperService: MapperService,
  ) {}

  async find(filter = {}) {
    return await this._todoRepository.find(filter);
  }

  async create(item: any) {
    return await this._todoRepository.save(item);
  }

  async update(item: any) {
    return await this._todoRepository.update(item.id, item);
  }

  async delete(id: number) {
    const deleted = await this._todoRepository.findOne(id);
    await this._todoRepository.delete(id);
    return deleted;
  }
}
