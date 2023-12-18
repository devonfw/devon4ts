import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PageRequest } from '../model/page-request';

export const GetPage = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  const { pageSize, pageNumber } = request.query;

  if (!pageSize || !pageNumber) {
    return undefined;
  }
  return new PageRequest(+pageNumber, +pageSize);
});
