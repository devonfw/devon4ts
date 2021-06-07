import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { CRUD_TYPE_ID } from '../defaults';

export const CrudType = <T = any>(type: ClassConstructor<T>): CustomDecorator<string> =>
  SetMetadata(CRUD_TYPE_ID, type);
