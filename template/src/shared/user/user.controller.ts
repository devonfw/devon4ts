import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
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
import { ApiException } from '../api-exception.model';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { getOperationId } from '../utilities/get-operation-id';
import { ChangePasswordDTO } from './models/dto/change-password.dto';
import { UserDTO } from './models/dto/user.dto';
import { UserRole } from './models/user-role.enum';
import { UserService } from './user.service';

@Controller('users')
@ApiUseTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Put('update')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('User', 'Update'))
  async update(@Body() userUpdate: UserDTO): Promise<UserDTO> {
    try {
      if (!userUpdate || !userUpdate.id) {
        throw new HttpException('Missing parameters', HttpStatus.BAD_REQUEST);
      }
      const exist = await this._userService
        .findById(userUpdate.id)
        .catch(err => {
          throw new HttpException(err, HttpStatus.BAD_REQUEST);
        });

      if (!exist) {
        throw new HttpException(
          ` No user Found with this id: ${userUpdate.id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (userUpdate.mail && userUpdate.mail.trim() !== '') {
        exist.mail = userUpdate.mail;
      }
      const updated = await this._userService
        .update(userUpdate.id, exist)
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
  @ApiOperation(getOperationId('User', 'Upgrade'))
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
  @ApiOperation(getOperationId('User', 'Downgrade'))
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
  @ApiOperation(getOperationId('User', 'ChangePassword'))
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
}
