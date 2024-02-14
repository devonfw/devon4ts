import { Class } from 'type-fest';

export class EntityNotFound<T> extends Error {
  private static readonly ERROR_ID?: string;

  constructor(entity: Class<T>, id: string | number) {
    super(`${EntityNotFound.ERROR_ID}: Document ${entity.name} with id ${id} not found`);
  }

  get errorId(): string | undefined {
    return EntityNotFound.ERROR_ID;
  }

  get name(): string {
    return EntityNotFound.name;
  }
}
