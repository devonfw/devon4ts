import { BadRequestException, Body, Controller, Get, HttpCode, Post, UseGuards, Response } from '@nestjs/common';
import { Response as eResponse } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../../user/model/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { LoginDTO } from '../model/login.dto';
import { GetUser } from '../decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @HttpCode(200)
  async login(@Body() login: LoginDTO, @Response() res: eResponse): Promise<void> {
    const token = await this.authService.login(login);
    res.setHeader('Authorization', 'Bearer ' + token);
    res.status(200).send();
  }

  @Post('register')
  async register(@Body() user: User): Promise<User> {
    try {
      const registered = await this.authService.register(user);
      return registered;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('currentuser')
  @UseGuards(AuthGuard())
  currentUser(@GetUser() user: User): User {
    return user;
  }
}
