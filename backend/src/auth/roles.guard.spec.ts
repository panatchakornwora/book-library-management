import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { RolesGuard } from './roles.guard';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

describe('RolesGuard', () => {
  const makeContext = (user?: { role?: Role }): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('allows when no roles required', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('allows when user role is permitted', () => {
    const reflector = {
      getAllAndOverride: jest
        .fn()
        .mockReturnValue([Role.ADMIN, Role.LIBRARIAN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext({ role: Role.ADMIN }))).toBe(true);
  });

  it('denies when user role missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.MEMBER]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });

  it('denies when user role not permitted', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([Role.MEMBER]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(makeContext({ role: Role.LIBRARIAN }))).toBe(
      false,
    );
  });
});
