import { LoginDTO } from './login.dto';
import { ApiModelProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';

export class RegisterDTO extends LoginDTO {
  @ApiModelProperty()
  mail!: string;
  @ApiModelProperty({
    default: UserRole.User,
    example: UserRole.User,
    enum: ['Admin', 'User'],
  })
  role!: string;
}
