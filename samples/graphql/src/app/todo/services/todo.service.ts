import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo } from '../schemas/todo.schema';

@Injectable()
export class TodoService {
  constructor(@InjectModel(Todo.name) private readonly todoModel: Model<Todo>) {}

  async findAll(): Promise<Todo[]> {
    return this.todoModel.find().exec();
  }

  async findOneById(id: string): Promise<Todo | null> {
    return this.todoModel.findById(id).exec();
  }

  async create(task: string): Promise<Todo> {
    const id = Types.ObjectId();
    const todo = {
      id,
      task,
    };
    const createdTodo = new this.todoModel(todo);
    return createdTodo.save();
  }

  async update(id: string, task: string): Promise<Todo | null> {
    return this.todoModel.findByIdAndUpdate(id, { task }).exec();
  }

  async delete(id: string): Promise<Todo | null> {
    return this.todoModel.findByIdAndDelete(id).exec();
  }
}
