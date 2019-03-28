import { UserRole } from './user-role.enum';
import { Entity, Column } from 'typeorm';
import { BaseModel } from '../../base.model';
import { Exclude } from 'class-transformer';

@Entity()
export class User extends BaseModel {
  @Column({ type: 'text', unique: true, nullable: false })
  username!: string;
  @Column({ type: 'text', unique: true, nullable: false })
  mail!: string;

  @Column({ type: 'text', nullable: false })
  @Exclude()
  password!: string;

  @Column({ type: 'text', nullable: false, default: UserRole.User })
  role!: string;
}
