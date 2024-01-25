import { <%= classify(name) %> } from '../model/entities/<%= name %>.entity';
import { Repository, EntityRepository } from 'typeorm';

@EntityRepository(<%= classify(name) %>)
export class <%= classify(name) %>Repository extends Repository<<%= classify(name) %>> {}
