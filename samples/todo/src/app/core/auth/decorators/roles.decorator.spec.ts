import { Roles } from './roles.decorator';
import { roles } from '../model/roles.enum';
import { Reflector } from '@nestjs/core';

@Roles(roles.USER, roles.ADMIN)
class RolesTest {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  @Roles(roles.ADMIN)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  oneHandler(): void {}
}

describe('Roles', () => {
  it('should reflect metadata in the class and methods', () => {
    const reflector = new Reflector();

    expect(reflector.get('roles', RolesTest)).toStrictEqual([roles.USER, roles.ADMIN]);
    expect(reflector.get('roles', RolesTest)).not.toStrictEqual([roles.USER]);
    expect(reflector.get('roles', RolesTest)).not.toStrictEqual([roles.ADMIN]);
    expect(reflector.get('roles', RolesTest.prototype.oneHandler)).toStrictEqual([roles.ADMIN]);
  });
});
