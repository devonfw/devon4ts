import { User } from '../../user/model/entities/user.entity';
import { IsDefined, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginDTO implements Pick<User, 'username' | 'password'> {
  @IsDefined()
  @IsString()
  @Expose()
  username!: string;

  @IsDefined()
  @IsString()
  @Expose()
  password!: string;
}
