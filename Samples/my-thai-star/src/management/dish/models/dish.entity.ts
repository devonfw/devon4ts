import { BaseModel } from 'shared/base.model';
import { Image } from '../../image/models/image.entity';
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Ingredient } from 'model/ingredient/ingredient.entity';
import { List } from 'lodash';
import { Category } from 'model/category/category.entity';

@Entity()
export class Dish extends BaseModel<Dish> {
  @Column({ type: 'nvarchar', length: 120 })
  Name: string;
  @Column({ type: 'nvarchar', length: 4000 })
  Description: string;
  @Column({ type: 'decimal', precision: 26 })
  Price: number;

  @OneToOne(type => Image)
  @JoinColumn({ name: 'Image_id', referencedColumnName: 'id' })
  Image: Image;

  @ManyToMany(type => Ingredient)
  @JoinTable({
    name: 'DishIngredient',
    joinColumn: { name: 'Dish_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'Ingredient_id', referencedColumnName: 'id' },
  })
  extras: Promise<List<Ingredient>>;

  @ManyToMany(type => Category)
  @JoinTable({
    name: 'DishCategory',
    joinColumn: { name: 'Dish_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'Category_id', referencedColumnName: 'id' },
  })
  categories: Promise<List<Category>>;
}
