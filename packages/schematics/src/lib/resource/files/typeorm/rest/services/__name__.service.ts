import { Page, PageRequest } from '@devon4node/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { EntityNotFound } from '../../shared/exceptions/entity-not-found.exception';
import { Create<%=classify(nameSingular)%>Dto } from '../model/dtos/create-<%=nameSingular%>.dto';
import { Update<%=classify(nameSingular)%>Dto } from '../model/dtos/update-<%=nameSingular%>.dto';
import { <%=classify(nameSingular)%> } from '../model/entities/<%=nameSingular%>.entity';

@Injectable()
export class <%=classify(name)%>Service {
  constructor(@InjectRepository(<%=classify(nameSingular)%>) private readonly repository: Repository<<%=classify(nameSingular)%>>) {}

  create(create<%=classify(nameSingular)%>Dto: Create<%=classify(nameSingular)%>Dto): Promise<<%=classify(nameSingular)%>> {
    const <%=camelize(nameSingular)%> = plainToClass(<%=classify(nameSingular)%>, create<%=classify(nameSingular)%>Dto);
    return this.repository.save(<%=camelize(nameSingular)%>);
  }

  async findAll(page?: PageRequest): Promise<<%=classify(nameSingular)%>[] | Page<<%=classify(nameSingular)%>>> {
    if (!page) {
      return this.repository.find();
    }

    const [content, total] = await this.repository.findAndCount({
      take: page.pageSize,
      skip: page.pageNumber * page.pageSize,
    });
    return new Page(content, { pageNumber: page.pageNumber, pageSize: page.pageSize, total });
  }

  async findOne(id: number): Promise<<%=classify(nameSingular)%>> {
    const found = await this.repository.findOneBy({ id: id });

    if (!found) {
      throw new EntityNotFound(<%=classify(nameSingular)%>, id);
    }

    return found;
  }

  async update(id: number, update<%=classify(nameSingular)%>Dto: Update<%=classify(nameSingular)%>Dto): Promise<<%=classify(nameSingular)%>> {
    const found = await this.repository.findOneBy({ id: id });
    const <%=camelize(nameSingular)%> = plainToClass(<%=classify(nameSingular)%>, { ...found, ...update<%=classify(nameSingular)%>Dto, id });

    if (!found) {
      throw new EntityNotFound(<%=classify(nameSingular)%>, id);
    }

    return this.repository.save(<%=camelize(nameSingular)%>);
  }

  async remove(id: number): Promise<<%=classify(nameSingular)%>> {
    const found = await this.repository.findOneBy({ id: id });

    if (!found) {
      throw new EntityNotFound(<%=classify(nameSingular)%>, id);
    }

    return this.repository.remove(found);
  }
}
