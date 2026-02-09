import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: { findUnique: jest.Mock };
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
  };
  let jwt: { signAsync: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    };

    jwt = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('throws when user not found', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(service.login('a@b.com', 'pass')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws when password invalid', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user_1',
      name: 'Admin',
      email: 'a@b.com',
      passwordHash: 'hash',
      role: 'ADMIN',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await expect(service.login('a@b.com', 'pass')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('returns accessToken and user', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: 'user_1',
      name: 'Admin',
      email: 'a@b.com',
      passwordHash: 'hash',
      role: 'ADMIN',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    jwt.signAsync.mockResolvedValueOnce('token');

    const result = await service.login('a@b.com', 'pass');

    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: 'user_1',
      name: 'Admin',
      email: 'a@b.com',
      role: 'ADMIN',
    });
    expect(result).toEqual({
      accessToken: 'token',
      refreshToken: expect.any(String),
      user: {
        id: 'user_1',
        email: 'a@b.com',
        role: 'ADMIN',
      },
    });
  });

  it('logout revokes refresh tokens', async () => {
    prisma.refreshToken.updateMany.mockResolvedValueOnce({ count: 1 });

    const result = await service.logout({
      userId: 'user_1',
      email: 'a@b.com',
      role: 'ADMIN',
      exp: 1700000000,
      name: 'admin',
    });

    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'user_1',
        revokedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result).toEqual({ message: 'Logged out' });
  });

  it('refresh rotates refresh token', async () => {
    prisma.refreshToken.findUnique.mockResolvedValueOnce({
      id: 'rt_1',
      tokenHash: 'hash',
      userId: 'user_1',
      expiresAt: new Date(Date.now() + 1000 * 60),
      revokedAt: null,
      user: {
        id: 'user_1',
        name: 'Admin',
        email: 'a@b.com',
        role: 'ADMIN',
      },
    });
    prisma.refreshToken.update.mockResolvedValueOnce({ id: 'rt_1' });
    prisma.refreshToken.create.mockResolvedValueOnce({ id: 'rt_2' });
    jwt.signAsync.mockResolvedValueOnce('token');

    const result = await service.refresh('refresh');

    expect(prisma.refreshToken.update).toHaveBeenCalledWith({
      where: { id: 'rt_1' },
      data: { revokedAt: expect.any(Date) },
    });
    expect(result).toEqual({
      accessToken: 'token',
      refreshToken: expect.any(String),
    });
  });
});
