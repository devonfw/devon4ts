import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiException } from '../api-exception.model';
import { UserDTO } from '../user/models/dto/user.dto';
import { GetOperationId } from '../utilities/get-operation-id';
import { AuthService } from './auth.service';
import { LoginResponseDTO } from './model/login-response.dto';
import { LoginDTO } from './model/login.dto';
import { RegisterDTO } from './model/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Auth', 'Login'))
  login(@Body() login: LoginDTO): Promise<LoginResponseDTO> {
    return this.authService.login(login);
  }

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('Auth', 'Register'))
  async register(@Body() newUserData: RegisterDTO): Promise<UserDTO> {
    return this.authService.register(newUserData);
  }
}
