import { Module } from '@nestjs/common';
import { Todo } from '~app/todo/model/entities/todo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoCrudService } from '~app/todo/services/todo.crud.service';
import { TodoCrudController } from '~app/todo/controllers/todo.crud.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  providers: [TodoCrudService],
  controllers: [TodoCrudController],
})
export class TodoModule { }
