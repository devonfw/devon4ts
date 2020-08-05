import { Module } from '@nestjs/common';
import { Employee } from '~app/employee/model/entities/employee.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeCrudService } from '~app/employee/services/employee.crud.service';
import { EmployeeCrudController } from '~app/employee/controllers/employee.crud.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [EmployeeCrudService],
  controllers: [EmployeeCrudController],
})
export class EmployeeModule { }
