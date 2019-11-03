import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
  Response,
} from '@nestjs/common';
import { Response as eResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../user/model/entities/user.entity';
import { AuthService } from '../services';
import { UserRequest } from '../model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: any, @Response() res: eResponse) {
    const token = await this.authService.login(body);
    res.setHeader('Authorization', 'Bearer ' + token);
    res.status(200).send();
  }

  @Post('register')
  async register(@Body() user: User) {
    try {
      const registered = await this.authService.register(user);
      return registered;
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
