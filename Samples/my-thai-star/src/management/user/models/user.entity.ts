import { UserRole } from './user-role.enum';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { BaseModel } from '../../../shared/base.model';
import { List } from 'lodash';
import { Dish } from 'management/dish/models/dish.entity';

@Entity()
export class User extends BaseModel<User> {
  @Column({ type: 'text', unique: true, nullable: false })
  username: string;
  @Column({ type: 'text', unique: true, nullable: false })
  mail: string;

  @Column({ type: 'text', nullable: false })
  password: string;

  @Column({ type: 'text', nullable: false, default: UserRole.Customer })
  role: string;

  @ManyToMany(type => Dish)
  @JoinTable({ name: 'UserFavourite' })
  favourites: List<Dish>;
}
