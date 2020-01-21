import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../model/entities/todo.entity';

@Injectable()
export class TodoCrudService extends TypeOrmCrudService<Todo> {
  constructor(@InjectRepository(Todo) repo: Repository<Todo>) {
    super(repo);
  }
}
