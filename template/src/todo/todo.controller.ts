import {
  Controller,
  Get,
  HttpStatus,
  Body,
  Post,
  HttpException,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './models/todo.entity';
import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TodoVm } from './models/view-models/todo-vm.model';
import { ApiException } from 'shared/api-exception.model';
import { TodoParams } from './models/view-models/todo-params.model';
import { GetOperationId } from 'shared/utilities/get-operation-id';

@Controller('todo')
@ApiUseTags('Todo')
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly _todoService: TodoService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: TodoVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Todo', 'GetAll'))
  async getTodos(): Promise<Todo[]> {
    try {
      return await this._todoService.findAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: TodoVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Todo', 'Create'))
  async create(@Body() params: TodoParams) {
    try {
      const { description } = params;
      if (!description) {
        throw new HttpException(
          'Description is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newTodo = await this._todoService.createTodo(params);
      return this._todoService.map<TodoVm>(newTodo);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put()
  @ApiResponse({ status: HttpStatus.CREATED, type: TodoVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Todo', 'Update'))
  async update(@Body() viewmodel: TodoVm): Promise<TodoVm> {
    try {
      const { id, description, priority, completed } = viewmodel;

      if (!viewmodel || !id) {
        throw new HttpException('Missing Parameters', HttpStatus.BAD_REQUEST);
      }

      const updated = await this._todoService.update(id, viewmodel);
      if (updated) {
        return await this._todoService.map<TodoVm>(updated); // This would be mapped
      } else {
        throw new HttpException(
          'An internal error has occurred and the object has not been updated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK, type: TodoVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Todo', 'Delete'))
  async delete(@Param('id') id: number): Promise<TodoVm> {
    try {
      const exists = await this._todoService.findById(id);
      if (!exists) {
        throw new HttpException(
          'No element found with this id',
          HttpStatus.BAD_REQUEST,
        );
      }
      const deleted = await this._todoService.deleteById(id);
      if (deleted) {
        return this._todoService.map<TodoVm>(deleted);
      } else {
        throw new HttpException(
          'An internal error has occurred and the object has not been deleted',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
