import {
  Entity,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { BaseModel } from 'shared/base.model';
import { Order } from './order.entity';
import { Dish } from 'management/dish/models/dish.entity';
import { Ingredient } from 'model/ingredient/ingredient.entity';

@Entity()
export class OrderLine extends BaseModel<OrderLine> {
  @Column({ type: 'int' })
  Amount: number;
  @Column({ type: 'nvarchar', length: 255 })
  Comment: string;

  @ManyToOne(type => Order, { eager: true })
  @JoinColumn({ name: 'IdOrder' })
  Order: Order;

  @OneToOne(type => Dish, { eager: true })
  @JoinColumn({ name: 'IdDish' })
  Dish: Dish;

  @ManyToMany(type => Ingredient, { eager: true })
  @JoinTable({
    name: 'OrderDishExtraIngredient',
    joinColumn: { name: 'IdOrderLine', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'IdIngredient', referencedColumnName: 'id' },
  })
  Extras: Array<Ingredient>;
}
