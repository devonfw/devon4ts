import { Todo } from './models';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Todo)
export class TodoRepository extends Repository<Todo> {
  constructor() {
    super();
  }
}
