import { SetMetadata, CustomDecorator } from '@nestjs/common';
import { ClassType } from 'class-transformer/ClassTransformer';
import { CRUD_TYPE_ID } from '../defaults';

export const CrudType = <T = any>(type: ClassType<T>): CustomDecorator<string> => SetMetadata(CRUD_TYPE_ID, type);
