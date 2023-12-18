import { Entity } from 'typeorm';
import { BaseEntity } from '../../../shared/model/entities/base.entity';

@Entity()
export class <%= classify(name) %> extends BaseEntity {

}
