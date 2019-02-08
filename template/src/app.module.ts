import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';

// @Module({
//   imports: [TypeOrmModule.forRoot(), SharedModule, TodoModule, UserModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
@Module({
  imports: [TypeOrmModule.forRoot(), SharedModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
