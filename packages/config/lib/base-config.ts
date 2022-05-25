import { IsBoolean, IsDefined, IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';

export class BaseConfig {
  @IsBoolean()
  @IsDefined()
  isDev!: boolean;
  @IsDefined()
  @IsNumber()
  @IsPositive()
  port!: number;
  @IsOptional()
  @IsString()
  host?: string;
  @IsOptional()
  @IsString()
  clientUrl?: string;
  @IsDefined()
  @IsString()
  defaultVersion!: string;
}
