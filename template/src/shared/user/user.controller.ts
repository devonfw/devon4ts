import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUseTags,
} from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ApiException } from '../api-exception.model';
import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/models';
import { getOperationId } from '../utilities/get-operation-id';
import { UserDTO, UserRole } from './models';
import { UserService } from './user.service';

@Controller('users')
@ApiUseTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Put('update')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.Admin)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('User', 'Update'))
  async update(@Body() userUpdate: Partial<UserDTO>): Promise<UserDTO> {
    try {
      const exist = await this._userService.findById(userUpdate.id);

      if (!exist) {
        throw new HttpException(
          ` This request can not be processed`,
          HttpStatus.NOT_FOUND,
        );
      }
      if (userUpdate.mail && userUpdate.mail.trim() !== '') {
        exist.mail = userUpdate.mail;
      }
      const updated = await this._userService.update(userUpdate.id, exist);
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
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('current-user')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.Admin, UserRole.User)
  @ApiResponse({ status: HttpStatus.CREATED, type: UserDTO })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
  @ApiOperation(getOperationId('User', 'Current-user'))
  getCurrentUser(@Req() request): UserDTO {
    return plainToClass(UserDTO, request.user as User, {
      strategy: 'excludeAll',
    });
  }
}
