import { ApiModelProperty } from '@nestjs/swagger';

export class ChangePasswordVm {
  @ApiModelProperty()
  username: string;
  @ApiModelProperty()
  password: string;
  @ApiModelProperty()
  newPassword: string;
}
