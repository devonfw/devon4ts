import { BaseModelDTO } from '../../../base.model';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../user-role.enum';
import { IsNotEmpty, IsEmail, IsIn } from 'class-validator';

export class UserDTO extends BaseModelDTO {
  @ApiModelProperty()
  @IsNotEmpty()
  username!: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsEmail()
  mail!: string;

  @ApiModelPropertyOptional({
    enum: Object.keys(UserRole),
    default: UserRole.User,
    example: UserRole.User,
  })
  @IsIn(Object.keys(UserRole))
  role?: string;
}
