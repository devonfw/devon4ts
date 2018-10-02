import { LoginVm } from './login-vm.model';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';

export class RegisterVm extends LoginVm {
  @ApiModelProperty()
  mail: string;
  @ApiModelPropertyOptional({ default: UserRole.User, example: UserRole.User })
  role?: string;
}
