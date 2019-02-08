import { TodoLevel } from '../todo-level.enum';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';

export class TodoParams {
  @ApiModelProperty()
  description!: string;
  @ApiModelPropertyOptional({
    enum: ['Low', 'Normal', 'High'],
    example: TodoLevel.Normal,
  })
  priority?: TodoLevel;
}
