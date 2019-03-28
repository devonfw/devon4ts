import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty } from 'class-validator';
import { BaseModelDTO } from '../../../base.model';
import { UserRole } from '../user-role.enum';
import { Expose } from 'class-transformer';

export class UserDTO extends BaseModelDTO {
  @ApiModelProperty()
  @IsNotEmpty()
  @Expose()
  username!: string;

  @ApiModelProperty()
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  mail!: string;

  @ApiModelPropertyOptional({
    enum: Object.keys(UserRole),
    default: UserRole.User,
    example: UserRole.User,
  })
  @IsIn(Object.keys(UserRole))
  @Expose()
  role?: string;
}
