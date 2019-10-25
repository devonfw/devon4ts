import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { TodoLevel } from '../todo-level.enum';
import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  IsDefined,
} from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';

@Entity()
export class Todo extends BaseEntity {
  @ApiModelProperty()
  @IsString()
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(200)
  @Column({ type: 'text', length: 200, nullable: false })
  description!: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsString()
  @Column({ type: 'text', default: TodoLevel.Normal })
  priority?: string;

  @ApiModelPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  completed?: boolean;
}
