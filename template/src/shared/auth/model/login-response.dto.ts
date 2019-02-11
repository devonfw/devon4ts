import { UserDTO } from '../../user/models/dto/user.dto';
import { ApiModelProperty } from '@nestjs/swagger';

export class LoginResponseDTO {
  @ApiModelProperty()
  token!: string;
  @ApiModelProperty()
  user!: UserDTO;
}
