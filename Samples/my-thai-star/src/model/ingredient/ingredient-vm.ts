import { BaseModelVM } from 'shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';

export class IngredientVm extends BaseModelVM {
  @ApiModelProperty()
  Name: string;
  @ApiModelProperty()
  Description: string;
  @ApiModelProperty()
  Price: number;
}
