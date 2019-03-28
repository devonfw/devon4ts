import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  username!: string;
  @IsNotEmpty()
  @IsString()
  @ApiModelProperty()
  password!: string;
}
