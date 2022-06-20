import { BadRequestException, Body, Controller, Get, HttpCode, Post, Response, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response as eResponse } from 'express';
import { User } from '../../user/model/entities/user.entity';
import { GetUser } from '../decorators/get-user.decorator';
import { LoginDTO } from '../model/login.dto';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../user/model/dto/create-user.dto';

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
  async register(@Body() user: CreateUserDto): Promise<User> {
    try {
      const registered = await this.authService.register(user);
      return registered;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  @ApiBearerAuth()
  @Get('currentuser')
  @UseGuards(AuthGuard())
  currentUser(@GetUser() user: User): User {
    return user;
  }
}
