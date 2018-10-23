import { ApiModelPropertyOptional, ApiModelProperty } from '@nestjs/swagger';
import { ImageVm } from 'image/models/view-models/image-vm';
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
