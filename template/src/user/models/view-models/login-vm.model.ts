import { ApiModelProperty } from '@nestjs/swagger';

export class LoginVm {
  [key: string]: string;
  @ApiModelProperty()
  username!: string;
  @ApiModelProperty()
  password!: string;
}
