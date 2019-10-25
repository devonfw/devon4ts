import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsDefined, IsOptional, MaxLength, IsEmail } from 'class-validator';
import { CrudValidationGroups } from '@nestjsx/crud';

@Entity()
export class Employee extends BaseEntity {
  @ApiModelPropertyOptional()
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @Column('varchar', { length: 255, nullable: true })
  name?: string;

  @ApiModelPropertyOptional()
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @Column('varchar', { length: 255, nullable: true })
  surname?: string;

  @ApiModelPropertyOptional()
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @IsEmail()
  @Column('varchar', { length: 255, nullable: true })
  email?: string;
}
