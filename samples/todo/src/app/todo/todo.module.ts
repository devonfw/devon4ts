import { Module } from '@nestjs/common';
import { Todo } from './model/entities/todo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoCrudService } from './services/todo.crud.service';
import { TodoCrudController } from './controllers/todo.crud.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  providers: [TodoCrudService],
  controllers: [TodoCrudController],
})
export class TodoModule {}
