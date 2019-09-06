import { ObjectLiteral } from 'typeorm/common/ObjectLiteral';
import { FindConditions } from 'typeorm/find-options/FindConditions';
/**
 * Simple condition that should be applied to match entities.
 */
export interface Where<Entity> {
  where?:
    | FindConditions<Entity>[]
    | FindConditions<Entity>
    | ObjectLiteral
    | string;
}
