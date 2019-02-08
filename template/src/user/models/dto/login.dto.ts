import { ApiModelProperty } from '@nestjs/swagger';

export class LoginDTO {
  [key: string]: string;
  @ApiModelProperty()
  username!: string;
  @ApiModelProperty()
  password!: string;
}
