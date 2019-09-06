import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { ApiException } from '../shared/api-exception.model';
import { getOperationId } from '../shared/utilities/get-operation-id';
import { TodoDTO, TodoParams } from './models';
import { TodoService } from './todo.service';
import { plainToClass } from 'class-transformer';
import { Todo } from './models/todo.entity';
import { FindManyOptions } from 'typeorm/find-options/FindManyOptions';
import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';

@Controller('todo')
@ApiUseTags('Todo')
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly _todoService: TodoService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: TodoDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Todo', 'GetAll'))
  async getTodos(@Query() params?: any): Promise<TodoDTO[]> {
    try {
      let filter: FindManyOptions<ObjectLiteral> = {};
      let orderValue, whereValue: any;

      if (params.order && params.order !== 'undefined') {
        orderValue = JSON.parse(params.order);
      }
      if (params.where && params.where !== 'undefined') {
        whereValue = JSON.parse(params.where);
      }
      filter = {
        order: orderValue,
        where: whereValue,
      };

      return plainToClass(TodoDTO, await this._todoService.findAll(filter), {
        strategy: 'excludeAll',
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiResponse({ status: HttpStatus.CREATED, type: TodoDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Todo', 'Create'))
  async create(@Body() params: TodoParams): Promise<TodoDTO> {
    try {
      const newTodo: Todo = await this._todoService.createTodo(params);

      return plainToClass(TodoDTO, newTodo, {
        strategy: 'excludeAll',
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put()
  @ApiResponse({ status: HttpStatus.CREATED, type: TodoDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Todo', 'Update'))
  async update(@Body() viewmodel: TodoDTO): Promise<TodoDTO> {
    try {
      const updated = await this._todoService.update(viewmodel.id, viewmodel);
      if (updated) {
        return plainToClass(TodoDTO, updated, {
          strategy: 'excludeAll',
        });
      } else {
        throw new HttpException(
          'An internal error has occurred and the object has not been updated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiResponse({ status: HttpStatus.OK, type: TodoDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Todo', 'Delete'))
  async delete(@Param('id') identifier: number): Promise<TodoDTO> {
    try {
      const deleted = await this._todoService.deleteById(identifier);
      if (deleted) {
        return plainToClass(TodoDTO, deleted, {
          strategy: 'excludeAll',
        });
      } else {
        throw new HttpException(
          'An internal error has occurred and the object has not been deleted',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
