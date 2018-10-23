import { BaseModelVM } from 'shared/base.model';
import { ApiModelProperty } from '@nestjs/swagger';

export class ImageVm extends BaseModelVM {
  @ApiModelProperty()
  Content: string;
  @ApiModelProperty()
  Name: string;
  @ApiModelProperty()
  MimeType: string;
  @ApiModelProperty()
  Extension: string;
  @ApiModelProperty()
  ContentType: number;
}
