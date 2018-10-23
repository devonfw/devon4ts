import { BaseModel } from 'shared/base.model';
import { Column, Entity } from 'typeorm';

@Entity()
export class Category extends BaseModel<Category> {
  @Column({ type: 'nvarchar', length: 120 })
  Name: string;

  @Column({ type: 'nvarchar', length: 255 })
  Description: string;

  @Column({ type: 'bigint' })
  Group: number;

  @Column({ type: 'int' })
  ShowOrder: number;
}
