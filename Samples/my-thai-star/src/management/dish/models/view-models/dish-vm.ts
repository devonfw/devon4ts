import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';
import { Entity } from 'typeorm';
import { BaseModelVM } from 'shared/base.model';

@Entity()
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
