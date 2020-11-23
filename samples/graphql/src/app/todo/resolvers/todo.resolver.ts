import { Resolver, Args, Mutation, Query } from '@nestjs/graphql';
import { TodoService } from '../services/todo.service';
import { Todo } from '../schemas/todo.schema';

@Resolver()
export class TodoResolver {
  constructor(private readonly todoService: TodoService) {}

  @Query('todos')
  findAll(): Promise<Todo[]> {
    return this.todoService.findAll();
  }

  @Query('todoById')
  findOneById(@Args('id') id: string): Promise<Todo | null> {
    return this.todoService.findOneById(id);
  }

  @Mutation()
  createTodo(@Args('task') task: string): Promise<Todo> {
    return this.todoService.create(task);
  }

  @Mutation()
  deleteTodo(@Args('id') id: string): Promise<Todo | null> {
    return this.todoService.delete(id);
  }
}
