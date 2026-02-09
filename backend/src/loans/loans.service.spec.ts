import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoansService } from './loans.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

describe('LoansService', () => {
  let service: LoansService;
  let prisma: {
    $transaction: jest.Mock;
    loan: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };
  let tx: {
    book: {
      updateMany: jest.Mock;
      update: jest.Mock;
    };
    loan: {
      create: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    tx = {
      book: {
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      loan: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    prisma = {
      $transaction: jest
        .fn()
        .mockImplementation((arg) =>
          Array.isArray(arg) ? Promise.all(arg) : Promise.resolve(arg(tx)),
        ),
      loan: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LoansService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<LoansService>(LoansService);
  });

  it('borrows a book when available', async () => {
    tx.book.updateMany.mockResolvedValueOnce({ count: 1 });
    tx.loan.create.mockResolvedValueOnce({
      id: 'loan_1',
      bookId: 'book_1',
      userId: 'user_1',
    });

    const result = await service.borrow(
      'book_1',
      'user_1',
      undefined,
      '2030-01-15',
    );

    expect(tx.book.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'book_1',
        availableQty: { gt: 0 },
      },
      data: { availableQty: { decrement: 1 } },
    });
    expect(tx.loan.create).toHaveBeenCalledWith({
      data: {
        bookId: 'book_1',
        userId: 'user_1',
        borrowedAt: expect.any(Date),
        dueDate: expect.any(Date),
      },
    });
    expect(result).toEqual({
      id: 'loan_1',
      bookId: 'book_1',
      userId: 'user_1',
    });
  });

  it('throws when book not available', async () => {
    tx.book.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(
      service.borrow('book_1', 'user_1', undefined, '2030-01-15'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a loan and increments availableQty', async () => {
    tx.loan.findFirst.mockResolvedValueOnce({
      id: 'loan_1',
      bookId: 'book_1',
      userId: 'user_1',
      returnedAt: null,
    });
    tx.loan.update.mockResolvedValueOnce({});
    tx.book.update.mockResolvedValueOnce({});

    const result = await service.returnLoan('loan_1', 'user_1');

    expect(tx.loan.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'loan_1',
        userId: 'user_1',
        returnedAt: null,
      },
    });
    expect(tx.loan.update).toHaveBeenCalledWith({
      where: { id: 'loan_1' },
      data: { returnedAt: expect.any(Date) },
    });
    expect(tx.book.update).toHaveBeenCalledWith({
      where: { id: 'book_1' },
      data: { availableQty: { increment: 1 } },
    });
    expect(result).toEqual({ ok: true });
  });

  it('throws when loan not found or already returned', async () => {
    tx.loan.findFirst.mockResolvedValueOnce(null);

    await expect(service.returnLoan('loan_1', 'user_1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns by book and increments availableQty', async () => {
    tx.loan.findFirst.mockResolvedValueOnce({
      id: 'loan_2',
      bookId: 'book_2',
      userId: 'user_1',
      returnedAt: null,
    });
    tx.loan.update.mockResolvedValueOnce({});
    tx.book.update.mockResolvedValueOnce({});

    const result = await service.returnByBook('book_2', 'user_1');

    expect(tx.loan.findFirst).toHaveBeenCalledWith({
      where: { bookId: 'book_2', userId: 'user_1', returnedAt: null },
      orderBy: { borrowedAt: 'desc' },
    });
    expect(tx.loan.update).toHaveBeenCalledWith({
      where: { id: 'loan_2' },
      data: { returnedAt: expect.any(Date) },
    });
    expect(tx.book.update).toHaveBeenCalledWith({
      where: { id: 'book_2' },
      data: { availableQty: { increment: 1 } },
    });
    expect(result).toEqual({ ok: true });
  });

  it('lists my active loans', async () => {
    const rows = [{ id: 'loan_1' }];
    prisma.loan.findMany.mockResolvedValueOnce(rows);

    const result = await service.listMyActive('user_1');

    expect(prisma.loan.findMany).toHaveBeenCalledWith({
      where: { userId: 'user_1', returnedAt: null },
      orderBy: { borrowedAt: 'desc' },
    });
    expect(result).toEqual(rows);
  });

  it('lists my history with pagination', async () => {
    prisma.loan.findMany.mockResolvedValueOnce([{ id: 'loan_1' }]);
    prisma.loan.count.mockResolvedValueOnce(1);

    const result = await service.listMyHistory('user_1', 1, 10);

    expect(prisma.loan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_1' },
        skip: 0,
        take: 10,
      }),
    );
    expect(prisma.loan.count).toHaveBeenCalledWith({
      where: { userId: 'user_1' },
    });
    expect(result).toEqual({
      items: [{ id: 'loan_1' }],
      total: 1,
      page: 1,
      pageSize: 10,
    });
  });

  it('lists history for member role', async () => {
    prisma.loan.findMany.mockResolvedValueOnce([{ id: 'loan_1' }]);
    prisma.loan.count.mockResolvedValueOnce(1);

    const result = await service.listHistory('user_1', Role.MEMBER, 1, 10);

    expect(prisma.loan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user_1' },
      }),
    );
    expect(result.total).toBe(1);
  });
});
