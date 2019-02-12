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

@Controller('todo')
@ApiUseTags('Todo')
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly _todoService: TodoService) {}

  @Get()
  @ApiResponse({ status: HttpStatus.OK, type: TodoDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Todo', 'GetAll'))
  async getTodos(): Promise<TodoDTO[]> {
    try {
      const result: TodoDTO[] = [];
      const retrieved = await this._todoService.findAll();
      for (const element of retrieved) {
        result.push(element as TodoDTO);
      }
      return result;
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
      const { description } = params;
      if (!description || description.trim() === '') {
        throw new HttpException(
          'Description is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const newTodo = await this._todoService.createTodo(params);
      const { id, ...result } = newTodo;
      return result as TodoDTO;
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
      if (!viewmodel || !viewmodel.id) {
        throw new HttpException('Missing Parameters', HttpStatus.BAD_REQUEST);
      }

      const updated = await this._todoService.update(viewmodel.id, viewmodel);
      if (updated) {
        const { id, ...result } = updated;
        return result as TodoDTO;
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
      const exists = await this._todoService.findById(identifier);
      if (!exists) {
        throw new HttpException(
          'No element found with this id',
          HttpStatus.BAD_REQUEST,
        );
      }
      const deleted = await this._todoService.deleteById(identifier);
      if (deleted) {
        const { id, ...result } = deleted;
        return result as TodoDTO;
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
