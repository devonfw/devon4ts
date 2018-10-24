import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';
import { BaseModelVM } from 'shared/base.model';

export class DishVm extends BaseModelVM {
  @ApiModelProperty()
  Name: string;
  @ApiModelProperty()
  Description: string;
  @ApiModelProperty()
  Price: number;
  @ApiModelPropertyOptional()
  Image_id?: number;
}
