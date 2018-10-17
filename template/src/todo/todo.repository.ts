import { Todo } from './models/todo.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  constructor() {
    super();
  }
}
