import { BaseModelDTO } from '../../../shared/base.model';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';

export class UserDTO extends BaseModelDTO {
  @ApiModelProperty()
  username!: string;

  @ApiModelProperty()
  mail!: string;

  @ApiModelPropertyOptional({
    enum: ['Admin', 'User'],
    default: UserRole.User,
    example: UserRole.User,
  })
  role?: string;
}
