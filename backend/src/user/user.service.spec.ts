import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((arg) => Promise.all(arg)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('prevents librarian from creating non-member', async () => {
    await expect(
      service.create(
        {
          name: 'A',
          email: 'a@test.com',
          password: 'pass',
          role: Role.LIBRARIAN,
        },
        Role.LIBRARIAN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents admin from creating admin', async () => {
    await expect(
      service.create(
        {
          name: 'A',
          email: 'a@test.com',
          password: 'pass',
          role: Role.ADMIN,
        },
        Role.ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('prevents duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user_1' });

    await expect(
      service.create(
        {
          name: 'A',
          email: 'a@test.com',
          password: 'pass',
          role: Role.MEMBER,
        },
        Role.ADMIN,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates user with hashed password', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed');
    prisma.user.create.mockResolvedValueOnce({
      id: 'user_1',
      name: 'A',
      email: 'a@test.com',
      role: Role.MEMBER,
    });

    const result = await service.create(
      {
        name: 'A',
        email: 'a@test.com',
        password: 'pass',
        role: Role.MEMBER,
      },
      Role.ADMIN,
    );

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'A',
        email: 'a@test.com',
        passwordHash: 'hashed',
        role: Role.MEMBER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    expect(result).toEqual({
      id: 'user_1',
      name: 'A',
      email: 'a@test.com',
      role: Role.MEMBER,
    });
  });

  it('lists users with pagination', async () => {
    prisma.user.findMany.mockResolvedValueOnce([{ id: 'user_1' }]);
    prisma.user.count.mockResolvedValueOnce(1);

    const result = await service.list(1, 10);

    expect(result).toEqual({
      items: [{ id: 'user_1' }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('removes user', async () => {
    prisma.user.delete.mockResolvedValueOnce({});

    const result = await service.remove('user_1');

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: 'user_1' },
    });
    expect(result).toEqual({ ok: true });
  });
});
