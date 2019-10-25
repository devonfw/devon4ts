import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [CoreModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
