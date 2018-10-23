import { BaseModel } from 'shared/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class Ingredient extends BaseModel<Ingredient> {
  @Column({ type: 'nvarchar', length: 120 })
  Name: string;
  @Column({ type: 'text' })
  Description: string;
  @Column({ type: 'decimal', precision: 26 })
  Price: number;
}
