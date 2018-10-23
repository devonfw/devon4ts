import {
  Controller,
  Post,
  HttpStatus,
  Body,
  HttpException,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserVm } from './models/view-models/user-vm.model';
import { ApiException } from '../../shared/api-exception.model';
import { GetOperationId } from '../../shared/utilities/get-operation-id';
import { RegisterVm } from './models/view-models/register-vm.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { LoginVm } from './models/view-models/login-vm.model';

@Controller('users')
@ApiUseTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Register'))
  async register(@Body() registerVm: RegisterVm): Promise<UserVm> {
    try {
      registerVm = this.validateRegister(registerVm);
      const newUser = await this._userService.register(registerVm);
      const { id, password, ...result } = newUser;
      return result;
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }

  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Login'))
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    try {
      const fields = Object.keys(loginVm);
      fields.forEach(field => {
        if (!loginVm[field]) {
          throw new HttpException(
            `${field} is required`,
            HttpStatus.BAD_REQUEST,
          );
        }
      });
      return await this._userService.login(loginVm);
    } catch (error) {
      throw new HttpException(error, error.getStatus());
    }
  }

  validateRegister(register: RegisterVm): RegisterVm {
    const { username, password, mail } = register;
    if (!username) {
      throw new HttpException('username is required', HttpStatus.BAD_REQUEST);
    }
    if (!password) {
      throw new HttpException('password is required', HttpStatus.BAD_REQUEST);
    }
    if (!mail) {
      throw new HttpException('mail is required', HttpStatus.BAD_REQUEST);
    }
    register.role = 'User';
    register.username = username.toLowerCase();
    register.mail = mail.toLowerCase();
    return register;
  }
}
