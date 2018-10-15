import { LoginVm } from './login-vm.model';
import { ApiModelProperty } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import { EnumToArray } from '../../../shared/utilities/enum-to-array';

export class RegisterVm extends LoginVm {
  @ApiModelProperty()
  mail: string;
  @ApiModelProperty({
    default: UserRole.User,
    example: UserRole.User,
    enum: EnumToArray(UserRole),
  })
  role: string;
}
