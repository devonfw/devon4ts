import { Module } from '@nestjs/common';
import { Employee } from './model/entities/employee.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeCrudService } from './services/employee.crud.service';
import { EmployeeCrudController } from './controllers/employee.crud.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [EmployeeCrudService],
  controllers: [EmployeeCrudController],
})
export class EmployeeModule {}
