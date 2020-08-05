import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { Employee } from '~app/employee/model/entities/employee.entity';
import { EmployeeCrudService } from '~app/employee/services/employee.crud.service';
import { ApiTags } from '@nestjs/swagger';

@Crud({
  model: {
    type: Employee,
  },
})
@CrudType(Employee)
@Controller('employee/employees')
@ApiTags('Employee')
export class EmployeeCrudController {
  constructor(public service: EmployeeCrudService) { }
}
