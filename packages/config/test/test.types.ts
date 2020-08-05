import { BaseConfig } from '~lib/base-config';
import { IsString, IsOptional, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NestedTypes {
  @IsString()
  @IsOptional()
  type?: string;
  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string;
  @IsString()
  @IsOptional()
  value?: string;
}

export class TestTypes extends BaseConfig {
  @ValidateNested()
  @Type(() => NestedTypes)
  nested?: NestedTypes;
}
