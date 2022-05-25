import { GetPage, Page, PageRequest } from '@devon4node/common';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { <%=classify(name)%> } from '../model/entities/<%=name%>.entity';
import { <%=classify(name)%>Service } from '../services/<%=name%>.service';


@Controller('<%=fullName%>')
export class <%=classify(name)%>Controller {
  constructor(private readonly service: <%=classify(name) %>Service) { }

  @Get()
  async getMany(@GetPage() page?: PageRequest): Promise<<%=classify(name) %>[] | Page<<%=classify(name) %>>> {
    const [result, count] = await this.service.getMany(page);

    if (!page) {
      return result;
    }

    return new Page<<%=classify(name) %>>(result, { pageNumber: page.pageNumber, pageSize: page.pageSize, total: count });
  }

  @Get('/:id')
  async getOne(@Param('id') id: number): Promise<<%=classify(name) %>> {
    const found = await this.service.getOne(id);

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  @Post()
  create(@Body() <%=camelize(name) %>: <%=classify(name) %>): Promise<<%=classify(name) %>> {
    return this.service.create(<%=camelize(name) %>);
  }

  private isIdValid(id: number, <%=camelize(name) %>: <%=classify(name) %>): boolean {
    return !<%=camelize(name) %>.id || id === <%=camelize(name) %>.id;
  }

  @Put('/:id')
  async replace(@Param('id') id: number, @Body() <%=camelize(name) %>: <%=classify(name) %>): Promise<<%=classify(name) %>> {
    if (!this.isIdValid(id, <%=camelize(name) %>)) {
      throw new BadRequestException();
    }

    const replaced = await this.service.replace(id, <%=camelize(name) %>);

    if (!replaced) {
      throw new NotFoundException();
    }

    return replaced;
  }

  @Patch('/:id')
  async update(@Param('id') id: number, @Body() <%=camelize(name) %>: <%=classify(name) %>): Promise<<%=classify(name) %>> {
    if (!this.isIdValid(id, <%=camelize(name) %>)) {
      throw new BadRequestException();
    }

    const updated = await this.service.update(id, <%=camelize(name) %>);

    if (!updated) {
      throw new NotFoundException();
    }

    return updated;
  }

  @Delete('/:id')
  async delete(@Param('id') id: number): Promise<<%=classify(name) %>> {
    const deleted = await this.service.delete(id);

    if (!deleted) {
      throw new NotFoundException();
    }

    return deleted;
  }
}
