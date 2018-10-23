import { Entity, Column } from 'typeorm';
import { BaseModel } from 'shared/base.model';

@Entity()
export class Image extends BaseModel<Image> {
  @Column({ type: 'nvarchar' })
  Content: string;
  @Column({ type: 'nvarchar' })
  Name: string;
  @Column({ type: 'nvarchar', length: 10 })
  MimeType: string;
  @Column({ type: 'nvarchar', length: 20 })
  Extension: string;
  @Column({ type: 'int' })
  ContentType: number;
}
