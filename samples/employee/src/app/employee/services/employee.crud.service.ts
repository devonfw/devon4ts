import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../model/entities/employee.entity';

@Injectable()
export class EmployeeCrudService extends TypeOrmCrudService<Employee> {
  constructor(@InjectRepository(Employee) repo: Repository<Employee>) {
    super(repo);
  }
}
