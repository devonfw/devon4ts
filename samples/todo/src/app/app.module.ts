import { Module } from '@nestjs/common';
import { AppController } from '~app/app.controller';
import { AppService } from '~app/app.service';
import { CoreModule } from '~app/core/core.module';
import { TodoModule } from '~app/todo/todo.module';

@Module({
  imports: [CoreModule, TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
