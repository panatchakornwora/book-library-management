import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Book } from '@prisma/client';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
  Prisma: {
    Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
  },
  Role: { ADMIN: 'ADMIN', LIBRARIAN: 'LIBRARIAN', MEMBER: 'MEMBER' },
}));

const createDto = {
  title: 'Book',
  author: 'Author',
  isbn: '1234567890',
  totalQty: 2,
};

const updateDto = {
  title: 'Book Updated',
};

const book: Book = {
  id: 'book_1',
  title: 'Book',
  author: 'Author',
  isbn: '1234567890',
  publicationYear: null,
  coverUrl: null,
  totalQty: 2,
  availableQty: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

  beforeEach(async () => {
    service = {
      list: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<BooksService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: service }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('lists books', async () => {
    service.list.mockResolvedValueOnce({
      items: [book],
      total: 1,
      page: 1,
      pageSize: 20,
    });

    await controller.list('test', '1', '20');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.list).toHaveBeenCalledWith('test', 1, 20);
  });

  it('gets book by id', async () => {
    service.getById.mockResolvedValueOnce(book);

    await controller.getById('book_1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.getById).toHaveBeenCalledWith('book_1');
  });

  it('creates book', async () => {
    service.create.mockResolvedValueOnce(book);

    await controller.create(createDto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.create).toHaveBeenCalledWith(createDto);
  });

  it('updates book', async () => {
    service.update.mockResolvedValueOnce({ ...book, title: updateDto.title });

    await controller.update('book_1', updateDto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.update).toHaveBeenCalledWith('book_1', updateDto);
  });

  it('removes book', async () => {
    service.remove.mockResolvedValueOnce(book);

    await controller.remove('book_1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.remove).toHaveBeenCalledWith('book_1');
  });
});
