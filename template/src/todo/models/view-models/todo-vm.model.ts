import { BaseModelVM } from '../../../shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';
import { EnumToArray } from '../../../shared/utilities/enum-to-array';
import { TodoLevel } from '../todo-level.enum';

export class TodoVm extends BaseModelVM {
  @ApiModelProperty()
  description: string;
  @ApiModelProperty({ enum: EnumToArray(TodoLevel) })
  priority: TodoLevel;
  @ApiModelProperty()
  completed: boolean;
}
