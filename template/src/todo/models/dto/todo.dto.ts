import { BaseModelDTO } from '../../../shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';
import { TodoLevel } from '../todo-level.enum';

export class TodoDTO extends BaseModelDTO {
  @ApiModelProperty()
  description!: string;
  @ApiModelProperty({
    enum: ['Low', 'Normal', 'High'],
  })
  priority!: TodoLevel;
  @ApiModelProperty()
  completed!: boolean;
}
