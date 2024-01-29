import { PrimaryGeneratedColumn, VersionColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @VersionColumn({ default: 1 })
  @Exclude({ toPlainOnly: true })
  version!: number;

  @CreateDateColumn()
  @Exclude({ toPlainOnly: true })
  createdAt!: string;

  @UpdateDateColumn()
  @Exclude({ toPlainOnly: true })
  updatedAt!: string;
}
