import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan, Role } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

type RequestWithUser = { user: { userId: string; role?: Role } };

describe('LoansController', () => {
  let controller: LoansController;
  let service: jest.Mocked<LoansService>;

  beforeEach(async () => {
    service = {
      borrow: jest.fn(),
      returnLoan: jest.fn(),
      returnByBook: jest.fn(),
      listMyActive: jest.fn(),
      listHistory: jest.fn(),
      listMyHistory: jest.fn(),
    } as unknown as jest.Mocked<LoansService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [{ provide: LoansService, useValue: service }],
    }).compile();

    controller = module.get<LoansController>(LoansController);
  });

  it('borrows a book', async () => {
    const loan: Loan = {
      id: 'loan_1',
      bookId: 'book_1',
      userId: 'user_1',
      borrowedAt: new Date(),
      returnedAt: null,
      dueDate: null,
    };
    service.borrow.mockResolvedValueOnce(loan);
    const req: RequestWithUser = { user: { userId: 'user_1' } };

    await controller.borrow(
      'book_1',
      { borrowedAt: undefined, dueDate: '2025-01-15T00:00:00.000Z' },
      req,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.borrow).toHaveBeenCalledWith(
      'book_1',
      'user_1',
      undefined,
      '2025-01-15T00:00:00.000Z',
    );
  });

  it('returns a loan', async () => {
    service.returnLoan.mockResolvedValueOnce({ ok: true });
    const req: RequestWithUser = { user: { userId: 'user_1' } };

    await controller.returnLoan('loan_1', { returnedAt: undefined }, req);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.returnLoan).toHaveBeenCalledWith(
      'loan_1',
      'user_1',
      undefined,
    );
  });

  it('returns by book id', async () => {
    service.returnByBook.mockResolvedValueOnce({ ok: true });
    const req: RequestWithUser = { user: { userId: 'user_1' } };

    await controller.returnByBook('book_1', { returnedAt: undefined }, req);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.returnByBook).toHaveBeenCalledWith(
      'book_1',
      'user_1',
      undefined,
    );
  });

  it('lists my active loans', async () => {
    service.listMyActive.mockResolvedValueOnce([]);
    const req: RequestWithUser = { user: { userId: 'user_1' } };

    await controller.myLoans(req);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.listMyActive).toHaveBeenCalledWith('user_1');
  });

  it('lists loan history', async () => {
    service.listHistory.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    const req: RequestWithUser = {
      user: { userId: 'user_1', role: Role.ADMIN },
    };

    await controller.history(req, '1', '20');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.listHistory).toHaveBeenCalledWith(
      'user_1',
      Role.ADMIN,
      1,
      20,
    );
  });

  it('lists my loan history', async () => {
    service.listMyHistory.mockResolvedValueOnce({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
    });
    const req: RequestWithUser = { user: { userId: 'user_1' } };

    await controller.myHistory(req, '1', '20');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.listMyHistory).toHaveBeenCalledWith('user_1', 1, 20);
  });
});
