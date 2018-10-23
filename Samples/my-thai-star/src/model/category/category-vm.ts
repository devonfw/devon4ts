import { BaseModelVM } from 'shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';

export class CategoryVm extends BaseModelVM {
  @ApiModelProperty()
  Name: string;

  @ApiModelProperty()
  Description: string;

  @ApiModelProperty()
  Group: number;

  @ApiModelProperty()
  ShowOrder: number;
}
