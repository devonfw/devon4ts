import { CrudType } from '@devon4node/common/serializer';
import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Crud } from '@nestjsx/crud';
import { Roles } from '~app/core/auth/decorators/roles.decorator';
import { RolesGuard } from '~app/core/auth/guards/roles.guard';
import { roles } from '~app/core/auth/model/roles.enum';
import { Todo } from '~app/todo/model/entities/todo.entity';
import { TodoCrudService } from '~app/todo/services/todo.crud.service';

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
@ApiTags('Todo')
@UseGuards(AuthGuard(), RolesGuard)
@Roles(roles.USER)
@ApiBearerAuth()
export class TodoCrudController {
  constructor(public service: TodoCrudService) {}
}
