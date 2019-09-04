import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { classToPlain } from 'class-transformer';
import { User } from '../../user/model/entity/user.entity';
import { AuthService } from '../services';
import { UserRequest } from '../model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: any) {
    return await this.authService.login(body);
  }

  @Post('register')
  async register(@Body() user: User) {
    try {
      const registered = await this.authService.register(user);
      return classToPlain(registered);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('currentuser')
  @UseGuards(AuthGuard())
  currentUser(@Request() req: UserRequest) {
    return req.user;
  }
}
