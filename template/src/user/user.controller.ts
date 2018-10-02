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
import { ApiException } from 'shared/api-exception.model';
import { GetOperationId } from 'shared/utilities/get-operation-id';
import { User } from './models/user.entity';
import { RegisterVm } from './models/view-models/register-vm.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { LoginVm } from './models/view-models/login-vm.model';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'shared/guards/roles.guard';
import { Roles } from 'shared/decorators/role.decorator';
import { UserRole } from './models/user-role.enum';
import { ChangePasswordVm } from './models/view-models/change-password-vm.model';

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
      const { username, password, mail } = registerVm;
      if (!username) {
        throw new HttpException('Username is required', HttpStatus.BAD_REQUEST);
      }
      if (!password) {
        throw new HttpException('Password is required', HttpStatus.BAD_REQUEST);
      }
      if (!mail) {
        throw new HttpException('Mail is required', HttpStatus.BAD_REQUEST);
      }
      registerVm.username = username.toLowerCase();
      registerVm.mail = mail.toLowerCase();
      const newUser = await this._userService.register(registerVm);
      return this._userService.map<UserVm>(newUser);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Login'))
  async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
    const fields = Object.keys(loginVm);
    fields.forEach(field => {
      if (!loginVm[field]) {
        throw new HttpException(`${field} is required`, HttpStatus.BAD_REQUEST);
      }
    });

    return this._userService.login(loginVm);
  }

  @Put('update')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Update'))
  async update(@Body() vm: UserVm): Promise<UserVm> {
    try {
      const { id, mail } = vm;
      if (!vm || !id) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(id).catch(err => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });

      if (!exist) {
        throw new HttpException(
          `${name} Not Found with this id: ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (mail && mail.trim() !== '') exist.mail = vm.mail;

      const updated = await this._userService.update(id, exist).catch(err => {
        throw new HttpException(err, HttpStatus.BAD_REQUEST);
      });
      if (updated) return this._userService.map<UserVm>(updated);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return vm;
  }

  @Put('upgrade/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Upgrade'))
  async upgrade(@Param('id') id: number): Promise<UserVm> {
    try {
      if (!id) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(id);

      if (!exist) {
        throw new HttpException(
          `No User found with the provided id: ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      exist.role = UserRole.Admin;

      const updated = await this._userService.update(id, exist);
      if (updated) return this._userService.map<UserVm>(updated);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('downgrade/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'Downgrade'))
  async downgrade(@Param('id') id: number): Promise<UserVm> {
    try {
      if (!id) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService.findById(id);

      if (!exist) {
        throw new HttpException(
          `No User found with the provided id: ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      exist.role = UserRole.User;

      const updated = await this._userService.update(id, exist);
      if (updated) return this._userService.map<UserVm>(updated);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('change-password')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(GetOperationId('User', 'ChangePassword'))
  async changePassword(@Body() user: ChangePasswordVm): Promise<User> {
    try {
      const { username, password, newPassword } = user;

      if (!username || !password || !newPassword) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const result = await this._userService.changePassword(user);
      if (!result)
        throw new HttpException(
          'An unexpected error has ocurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      return result;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
