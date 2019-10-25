import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { <%=classify(name)%> } from '../model';

@Injectable()
export class <%=classify(name)%>CrudService extends TypeOrmCrudService<<%=classify(name)%>> {
  constructor(@InjectRepository(<%=classify(name)%>) repo: Repository<<%=classify(name)%>>) {
    super(repo);
  }
}
