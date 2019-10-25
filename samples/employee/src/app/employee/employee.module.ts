import { Module } from '@nestjs/common';
import { Employee } from './model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeCrudService } from './services';
import { EmployeeCrudController } from './controllers';

@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  providers: [EmployeeCrudService],
  controllers: [EmployeeCrudController],
})
export class EmployeeModule {}
