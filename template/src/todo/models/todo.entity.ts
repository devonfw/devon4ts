import { BaseModel } from '../../shared/base.model';
import { Entity, Column } from 'typeorm';
import { TodoLevel } from './todo-level.enum';

@Entity()
export class Todo extends BaseModel {
  @Column({ type: 'text', length: 200 })
  description!: string;

  @Column({ type: 'text', default: TodoLevel.Normal })
  priority!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;
}
