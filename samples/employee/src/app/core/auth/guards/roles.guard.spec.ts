import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { roles } from '../model/roles.enum';

function generateMockExecutionContext(role: number): any {
  return {
    switchToHttp: (): any => {
      return {
        getRequest: (): any => {
          return {
            user: {
              role,
            },
          };
        },
      };
    },
    getHandler: (): undefined => undefined,
    getClass: (): undefined => undefined,
  };
}

describe('RolesGuard', () => {
  describe('canActivate', () => {
    let guard: RolesGuard;
    beforeEach(async () => {
      const reflector = new Reflector();
      // tslint:disable-next-line: variable-name
      jest
        .spyOn(reflector, 'get')
        .mockImplementationOnce(() => [roles.USER])
        .mockImplementationOnce(() => [roles.ADMIN])
        .mockImplementationOnce(() => [roles.ADMIN, roles.USER])
        .mockImplementation(() => undefined);
      guard = new RolesGuard(reflector);
    });
    it('should return true when the role of the user is in the roles array reflected by the handler or class', () => {
      const mockExecutionContext: any = generateMockExecutionContext(roles.USER);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(true);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(false);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(true);
    });
    it('should return false when the role of the user is not in the roles array reflected by the handler or class', () => {
      const mockExecutionContext: any = generateMockExecutionContext(roles.ADMIN);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(false);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(true);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(true);
    });
    it('should return true if no role metadata is defined', () => {
      const mockExecutionContext: any = generateMockExecutionContext(roles.ADMIN);
      guard.canActivate(mockExecutionContext as any);
      guard.canActivate(mockExecutionContext as any);
      guard.canActivate(mockExecutionContext as any);
      expect(guard.canActivate(mockExecutionContext as any)).toBe(true);
    });
  });
});
