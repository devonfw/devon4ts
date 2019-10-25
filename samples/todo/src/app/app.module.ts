import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [CoreModule, TodoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
