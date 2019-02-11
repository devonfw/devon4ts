import { ApiModelProperty } from '@nestjs/swagger';

export class ChangePasswordDTO {
  @ApiModelProperty()
  username!: string;
  @ApiModelProperty()
  password!: string;
  @ApiModelProperty()
  newPassword!: string;
}
