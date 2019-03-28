import { TodoLevel } from '../todo-level.enum';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class TodoParams {
  @ApiModelProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;
  @ApiModelPropertyOptional({
    enum: Object.keys(TodoLevel),
    example: TodoLevel.Normal,
  })
  @IsIn(Object.keys(TodoLevel))
  priority?: TodoLevel;
}
