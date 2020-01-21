import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base-entity.entity';
import { CrudValidationGroups } from '@nestjsx/crud';
import { IsDefined, IsOptional, MaxLength, IsEmail } from 'class-validator';

@Entity()
export class Employee extends BaseEntity {
  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @Column('varchar', { length: 255, nullable: true })
  name?: string;

  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @Column('varchar', { length: 255, nullable: true })
  surname?: string;

  @IsDefined({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @MaxLength(255)
  @IsEmail()
  @Column('varchar', { length: 255, nullable: true })
  email?: string;
}
