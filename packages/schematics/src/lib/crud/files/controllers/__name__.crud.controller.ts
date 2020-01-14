import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { <%=classify(name)%> } from '../model/entities/<%=name%>.entity';
import { <%=classify(name)%>CrudService } from '../services/<%=name%>.crud.service';

@Crud({
  model: {
    type: <%=classify(name)%>,
  },
})
@CrudType(<%=classify(name) %>)
@Controller('<%=fullName%>')
export class <%=classify(name)%>CrudController {
  constructor(public service: <%=classify(name)%>CrudService) {}
}
