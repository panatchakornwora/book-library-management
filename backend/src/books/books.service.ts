import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisService,
  ) {}

  private invalidateCache() {
    return Promise.all([
      this.cache.delByPrefix('books:list:'),
      this.cache.delByPrefix('books:most-borrowed'),
    ]);
  }

  async list(query?: string, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, pageSize));
    const skip = (safePage - 1) * safeSize;
    const q = query?.trim() || '';
    const cacheKey = `books:list:q=${encodeURIComponent(q)}:p=${safePage}:s=${safeSize}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as {
        items: unknown[];
        total: number;
        page: number;
        pageSize: number;
      };
    }

    const where = q
      ? {
          OR: [
            { title: { contains: q, mode: Prisma.QueryMode.insensitive } },
            { author: { contains: q, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: safeSize,
      }),
      this.prisma.book.count({ where }),
    ]);

    const result = { items, total, page: safePage, pageSize: safeSize };
    const ttl = Number(process.env.BOOKS_CACHE_TTL_SECONDS) || 60;
    await this.cache.set(cacheKey, JSON.stringify(result), ttl);
    return result;
  }

  async getById(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  create(dto: CreateBookDto) {
    return this.prisma.book
      .create({
        data: {
          ...dto,
          availableQty: dto.totalQty,
        },
      })
      .finally(() => this.invalidateCache());
  }

  async update(id: string, dto: UpdateBookDto) {
    const existing = await this.getById(id);

    let availableQty = existing.availableQty;
    if (dto.totalQty !== undefined) {
      const diff = dto.totalQty - existing.totalQty;
      availableQty = Math.max(0, existing.availableQty + diff);
    }

    return this.prisma.book
      .update({
        where: { id },
        data: {
          ...dto,
          ...(dto.totalQty !== undefined
            ? { availableQty, totalQty: dto.totalQty }
            : {}),
        },
      })
      .finally(() => this.invalidateCache());
  }

  async remove(id: string) {
    await this.getById(id);
    return this.prisma.book
      .delete({ where: { id } })
      .finally(() => this.invalidateCache());
  }

  async removeQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const book = await this.getById(id);
    const activeLoans = await this.prisma.loan.count({
      where: { bookId: id, returnedAt: null },
    });

    if (quantity > book.availableQty) {
      throw new BadRequestException(
        'Cannot delete more than available quantity',
      );
    }

    const newTotal = book.totalQty - quantity;
    const newAvailable = book.availableQty - quantity;

    if (newTotal === 0 && activeLoans === 0) {
      return this.prisma.book
        .delete({ where: { id } })
        .finally(() => this.invalidateCache());
    }

    return this.prisma.book
      .update({
        where: { id },
        data: { totalQty: newTotal, availableQty: newAvailable },
      })
      .finally(() => this.invalidateCache());
  }

  async mostBorrowed(limit = 5) {
    const safeLimit = Math.min(20, Math.max(1, limit));
    const cacheKey = `books:most-borrowed:l=${safeLimit}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as {
        items: { book: unknown; borrowCount: number }[];
      };
    }

    const grouped = await this.prisma.loan.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: safeLimit,
    });

    if (grouped.length === 0) {
      return { items: [] as { book: unknown; borrowCount: number }[] };
    }

    const ids = grouped.map((g) => g.bookId);
    const books = await this.prisma.book.findMany({
      where: { id: { in: ids } },
    });
    const bookMap = new Map(books.map((book) => [book.id, book]));
    const items = grouped
      .map((g) => ({
        book: bookMap.get(g.bookId),
        borrowCount: g._count.bookId,
      }))
      .filter((item) => item.book);

    const result = { items };
    const ttl = Number(process.env.BOOKS_MOST_BORROWED_TTL_SECONDS) || 120;
    await this.cache.set(cacheKey, JSON.stringify(result), ttl);
    return result;
  }

  uploadCover(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const baseUrl =
      process.env.PUBLIC_BASE_URL ||
      `http://localhost:${process.env.PORT || 3001}`;
    return { url: `${baseUrl}/uploads/${file.filename}` };
  }
}
