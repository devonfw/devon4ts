import { CrudValidationGroups } from '@nestjsx/crud';
import { IsBoolean, IsDefined, IsOptional, IsString, MaxLength } from 'class-validator';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { TodoLevel } from '../todo-level.enum';

@Entity()
export class Todo extends BaseEntity {
  @IsString()
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(200)
  @Column({ type: 'text', length: 200, nullable: false })
  description!: string;

  @IsOptional()
  @IsString()
  @Column({ type: 'text', default: TodoLevel.Normal })
  priority?: string;

  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  completed?: boolean;
}
