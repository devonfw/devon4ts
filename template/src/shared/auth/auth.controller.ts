import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ApiException } from '../api-exception.model';
import { UserDTO } from '../user/models';
import { getOperationId } from '../utilities/get-operation-id';
import { AuthService } from './auth.service';
import { LoginResponseDTO, LoginDTO, RegisterDTO } from './model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Auth', 'Login'))
  login(@Body() login: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(login);
  }

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('Auth', 'Register'))
  async register(@Body() newUserData: RegisterDTO): Promise<UserDTO> {
    return this.authService.register(newUserData);
  }
}
