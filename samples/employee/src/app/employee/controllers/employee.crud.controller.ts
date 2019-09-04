import { Controller } from '@nestjs/common';
import { Crud } from '@nestjsx/crud';
import { CrudType } from '@devon4node/common/serializer';
import { Employee } from '../model';
import { EmployeeCrudService } from '../services';

@Crud({
  model: {
    type: Employee,
  },
})
@CrudType(Employee)
@Controller('employee/employees')
export class EmployeeCrudController {
  constructor(public service: EmployeeCrudService) {}
}
