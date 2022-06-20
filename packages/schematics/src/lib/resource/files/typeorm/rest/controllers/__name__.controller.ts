import { GetPage, Page, PageRequest } from '@devon4node/common';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Create<%=classify(nameSingular)%>Dto } from '../model/dtos/create-<%=nameSingular%>.dto';
import { Update<%=classify(nameSingular)%>Dto } from '../model/dtos/update-<%=nameSingular%>.dto';
import { <%=classify(nameSingular)%> } from '../model/entities/<%=nameSingular%>.entity';
import { <%=classify(name)%>Service } from '../services/<%=name%>.service';

@Controller('<%=name%>')
export class <%=classify(name)%>Controller {
  constructor(private readonly service: <%=classify(name)%>Service) {}

  @Post()
  create(@Body() create<%=classify(nameSingular)%>Dto: Create<%=classify(nameSingular)%>Dto): Promise<<%=classify(nameSingular)%>> {
    return this.service.create(create<%=classify(nameSingular)%>Dto);
  }

  @Get()
  findAll(@GetPage() page?: PageRequest): Promise<<%=classify(nameSingular)%>[] | Page<<%=classify(nameSingular)%>>> {
    return this.service.findAll(page);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<<%=classify(nameSingular)%>> {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() update<%=classify(nameSingular)%>Dto: Update<%=classify(nameSingular)%>Dto): Promise<<%=classify(nameSingular)%>> {
    return this.service.update(+id, update<%=classify(nameSingular)%>Dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<<%=classify(nameSingular)%>> {
    return this.service.remove(+id);
  }
}
