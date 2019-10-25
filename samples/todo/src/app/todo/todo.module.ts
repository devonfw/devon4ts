import { Module } from '@nestjs/common';
import { Todo } from './model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TodoCrudService } from './services';
import { TodoCrudController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  providers: [TodoCrudService],
  controllers: [TodoCrudController],
})
export class TodoModule {}
