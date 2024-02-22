import { Expose } from 'class-transformer';
import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @Expose()
  @IsDefined()
  @IsString()
  username!: string;

  @Expose()
  @IsDefined()
  @IsString()
  password!: string;

  @Expose()
  @IsDefined()
  @IsNumber()
  role!: number;
}
