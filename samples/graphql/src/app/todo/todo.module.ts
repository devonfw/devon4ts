import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './schemas/todo.schema';
import { TodoService } from './services/todo.service';
import { TodoResolver } from './resolvers/todo.resolver';

@Module({
  imports: [MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }])],
  providers: [TodoService, TodoResolver],
})
export class TodoModule {}
