import { Entity } from 'typeorm';
import { BaseEntity } from '../../init-typeorm/files/src/app/shared/model/entities/base.entity';

@Entity()
export class <%= classify(name) %> extends BaseEntity {

}
