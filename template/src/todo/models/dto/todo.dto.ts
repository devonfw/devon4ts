import { BaseModelDTO } from '../../../shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';
import { TodoLevel } from '../todo-level.enum';
import { Expose } from 'class-transformer';

export class TodoDTO extends BaseModelDTO {
  @ApiModelProperty()
  @Expose()
  description!: string;
  @ApiModelProperty({
    enum: ['Low', 'Normal', 'High'],
  })
  @Expose()
  priority!: TodoLevel;
  @ApiModelProperty()
  @Expose()
  completed!: boolean;
}
