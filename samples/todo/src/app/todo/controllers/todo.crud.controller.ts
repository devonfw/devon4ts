import { Controller, UseGuards } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { Todo } from '../model';
import { TodoCrudService } from '../services';
import { ApiUseTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { roles } from '../../core/auth/model/roles.enum';
import { Roles } from '../../core/auth/decorators';

@Crud({
  model: {
    type: Todo,
  },
  routes: {
    replaceOneBase: {
      decorators: [Roles(roles.ADMIN)],
    },
    updateOneBase: {
      decorators: [Roles(roles.ADMIN)],
    },
  },
})
@CrudType(Todo)
@Controller('todo/todos')
@ApiUseTags('todo')
@UseGuards(AuthGuard(), RolesGuard)
@Roles(roles.USER)
export class TodoCrudController {
  constructor(public service: TodoCrudService) {}
}
