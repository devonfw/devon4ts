import { UserDTO } from './user.dto';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginResponseDTO {
  @ApiModelProperty()
  token!: string;
  @ApiModelProperty()
  user!: UserDTO;
}
