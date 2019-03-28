import { ApiModelPropertyOptional } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export class BaseModelDTO {
  @ApiModelPropertyOptional({ type: String, format: 'date-time' })
  @Expose()
  createdAt?: Date;

  @ApiModelPropertyOptional({ type: String, format: 'date-time' })
  @Expose()
  updatedAt?: Date;

  @ApiModelPropertyOptional()
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  id?: number;
}
