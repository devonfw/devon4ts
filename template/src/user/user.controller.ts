import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { ApiException } from '../shared/api-exception.model';
import { GetOperationId } from '../shared/utilities/get-operation-id';
import { ChangePasswordDTO } from './models/dto/change-password.dto';
import { UserDTO } from './models/dto/user.dto';
import { UserRole } from './models/user-role.enum';
import { UserService } from './user.service';
import { LoginResponseDTO } from './models/dto/login-response.dto';
import { RegisterDTO } from './models/dto/register.dto';
import { LoginDTO } from './models/dto/login.dto';
import { RolesGuard } from '../shared/auth/guards/roles.guard';
import { Roles } from '../shared/auth/decorators/role.decorator';

@Controller('users')
@ApiUseTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post('register')
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Register'))
  async register(@Body() registerVm: RegisterDTO): Promise<UserDTO> {
    try {
      registerVm = this.validateRegister(registerVm);
      const newUser = await this._userService.register(registerVm);
      const { id, password, ...result } = newUser;
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @ApiResponse({ status: HttpStatus.OK, type: LoginResponseDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Login'))
  async login(@Body() loginVm: LoginDTO): Promise<LoginResponseDTO> {
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
      throw error;
    }
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Update'))
  async update(@Body() vm: UserDTO): Promise<UserDTO> {
    try {
      if (!vm || !vm.id) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(vm.id).catch(err => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });

      if (!exist) {
        throw new HttpException(
          ` No user Found with this id: ${vm.id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (vm.mail && vm.mail.trim() !== '') {
        exist.mail = vm.mail;
      }
      const updated = await this._userService
        .update(vm.id, exist)
        .catch(err => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });
      if (updated) {
        const { id, ...result } = updated;
        return result as UserDTO;
      } else {
        throw new HttpException(
          'The user could not be updated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Put('upgrade/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Upgrade'))
  async upgrade(@Param('id') identificator: number): Promise<UserDTO> {
    try {
      if (!identificator) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(identificator);

      if (!exist) {
        throw new HttpException(
          `No User found with the provided id: ${identificator}`,
          HttpStatus.NOT_FOUND,
        );
      }
      exist.role = UserRole.Admin;

      const updated = await this._userService.update(identificator, exist);
      if (updated) {
        const { id, ...result } = updated;
        return result;
      } else {
        throw new HttpException(
          'The user could not be upgraded',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Put('downgrade/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Downgrade'))
  async downgrade(@Param('id') identificator: number): Promise<UserDTO> {
    try {
      if (!identificator) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(identificator);

      if (!exist) {
        throw new HttpException(
          `No User found with the provided id: ${identificator}`,
          HttpStatus.NOT_FOUND,
        );
      }
      exist.role = UserRole.User;

      const updated = await this._userService.update(identificator, exist);
      if (updated) {
        const { id, ...result } = updated;
        return result;
      } else {
        throw new HttpException(
          'The user could not be downgraded',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      throw error;
    }
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'ChangePassword'))
  async changePassword(@Body() user: ChangePasswordDTO): Promise<UserDTO> {
    try {
      const { username, newPassword } = user;

      if (!username || !user.password || !newPassword) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const result = await this._userService.changePassword(user);
      if (!result) {
        throw new HttpException(
          'An unexpected error has ocurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      const { id, password, ...resultVm } = result;
      return resultVm;
    } catch (error) {
      throw error;
    }
  }

  validateRegister(register: RegisterDTO): RegisterDTO {
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
