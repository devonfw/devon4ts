import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { CoreModule } from '~app/core/core.module';
import { EmployeeModule } from '~app/employee/employee.module';

@Module({
  imports: [CoreModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
