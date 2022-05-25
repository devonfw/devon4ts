import { PageRequest } from '@devon4node/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { <%=classify(name)%> } from '../model/entities/<%=name%>.entity';

@Injectable()
export class <%=classify(name)%>Service {
  constructor(@InjectRepository(<%=classify(name) %>) private readonly repository: Repository<<%=classify(name) %>>) {}

  getOne(id: number): Promise<<%=classify(name) %> | undefined> {
    return this.repository.findOne(id);
  }

  async getMany(page ?: PageRequest): Promise < [<%=classify(name) %> [], number] > {
    if (!page) {
      return [await this.repository.find(), 0];
    }

    return this.repository.findAndCount({
      take: page?.pageSize,
      skip: !page ? undefined : page.pageNumber * page.pageSize,
    });
  }

  create(<%=camelize(name) %>: <%=classify(name) %>): Promise<<%=classify(name) %>> {
    return this.repository.save(<%=camelize(name) %>);
  }

  async update(id: number, <%=camelize(name) %>: Partial<<%=classify(name) %>>): Promise<<%=classify(name) %>> {
    const found = await this.getOne(id);

    if (!found) {
      return undefined;
    }

    return this.repository.save({ ...found, ...<%=camelize(name) %> });
  }

  async replace(id: number, <%=camelize(name) %>: <%=classify(name) %>): Promise<<%=classify(name) %>> {
    const found = await this.getOne(id);

    if (!found) {
      return undefined;
    }

    return this.repository.save({ ...found, ...<%=camelize(name) %> });
  }

  async delete(id: number): Promise<<%=classify(name) %> | undefined> {
    const found = await this.getOne(id);

    if (!found) {
      return undefined;
    }

    const deleted = await this.repository.delete(id);

    if (!deleted.affected) {
      return undefined;
    }

    return found;
  }
}
