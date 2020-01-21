/* istanbul ignore file */
import { createParamDecorator } from '@nestjs/common';
import { UserRequest } from '../model/user-request.interface';

export const GetUser = createParamDecorator((_data, req: UserRequest) => {
  return req.user;
});
