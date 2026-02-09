import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';
import { RedisService } from '../cache/redis.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
    QueryMode: { insensitive: 'insensitive' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

const makeBook = (overrides: Record<string, unknown> = {}) => ({
  id: 'book_1',
  title: 'Clean Architecture',
  author: 'Robert C. Martin',
  isbn: '1234567890',
  publicationYear: 2018,
  coverUrl: null,
  totalQty: 3,
  availableQty: 3,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    loan: {
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let cache: { get: jest.Mock; set: jest.Mock; delByPrefix: jest.Mock };

  beforeEach(async () => {
    prisma = {
      book: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      loan: {
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
      delByPrefix: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: cache },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('lists books with query', async () => {
    const books = [makeBook()];
    prisma.$transaction.mockResolvedValueOnce([books, 1]);
    cache.get.mockResolvedValueOnce(null);

    const result = await service.list('clean', 1, 20);

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual({
      items: books,
      total: 1,
      page: 1,
      pageSize: 20,
    });
  });

  it('returns cached list result', async () => {
    const cached = {
      items: [{ ...makeBook(), createdAt: '2025-01-01T00:00:00.000Z' }],
      total: 1,
      page: 1,
      pageSize: 20,
    };
    cache.get.mockResolvedValueOnce(JSON.stringify(cached));

    const result = await service.list('clean', 1, 20);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(result).toEqual(cached);
  });

  it('throws when book not found', async () => {
    prisma.book.findUnique.mockResolvedValueOnce(null);

    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates book with availableQty = totalQty', async () => {
    const created = makeBook({ totalQty: 5, availableQty: 5 });
    prisma.book.create.mockResolvedValueOnce(created);

    const result = await service.create({
      title: 'Book',
      author: 'Author',
      isbn: '9876543210',
      totalQty: 5,
    });

    expect(prisma.book.create).toHaveBeenCalledWith({
      data: {
        title: 'Book',
        author: 'Author',
        isbn: '9876543210',
        totalQty: 5,
        availableQty: 5,
      },
    });
    expect(result).toEqual(created);
  });

  it('updates totalQty and recalculates availableQty', async () => {
    const existing = makeBook({ totalQty: 2, availableQty: 1 });
    prisma.book.findUnique.mockResolvedValueOnce(existing);
    prisma.book.update.mockResolvedValueOnce(
      makeBook({ totalQty: 5, availableQty: 4 }),
    );

    await service.update('book_1', {
      totalQty: 5,
    });

    expect(prisma.book.update).toHaveBeenCalledWith({
      where: { id: 'book_1' },
      data: { totalQty: 5, availableQty: 4 },
    });
  });

  it('removes book', async () => {
    prisma.book.findUnique.mockResolvedValueOnce(makeBook());
    prisma.book.delete.mockResolvedValueOnce(makeBook());

    await service.remove('book_1');

    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: 'book_1' },
    });
  });

  it('throws when removing invalid quantity', async () => {
    await expect(service.removeQuantity('book_1', 0)).rejects.toBeInstanceOf(
      Error,
    );
  });

  it('deletes book when removing last quantity and no active loans', async () => {
    prisma.book.findUnique.mockResolvedValueOnce(
      makeBook({ totalQty: 1, availableQty: 1 }),
    );
    prisma.loan.count.mockResolvedValueOnce(0);
    prisma.book.delete.mockResolvedValueOnce(
      makeBook({ totalQty: 1, availableQty: 1 }),
    );

    await service.removeQuantity('book_1', 1);

    expect(prisma.book.delete).toHaveBeenCalledWith({
      where: { id: 'book_1' },
    });
  });

  it('returns empty most borrowed when no loans', async () => {
    cache.get.mockResolvedValueOnce(null);
    prisma.loan.groupBy.mockResolvedValueOnce([]);

    const result = await service.mostBorrowed(5);

    expect(result).toEqual({ items: [] });
  });

  it('returns most borrowed books', async () => {
    cache.get.mockResolvedValueOnce(null);
    prisma.loan.groupBy.mockResolvedValueOnce([
      { bookId: 'book_1', _count: { bookId: 2 } },
    ]);
    prisma.book.findMany.mockResolvedValueOnce([makeBook()]);

    const result = await service.mostBorrowed(5);

    expect(result.items[0]).toEqual({
      book: expect.objectContaining({ id: 'book_1' }),
      borrowCount: 2,
    });
  });

  it('throws when upload cover missing file', () => {
    expect(() =>
      service.uploadCover(undefined as unknown as Express.Multer.File),
    ).toThrow();
  });
});
