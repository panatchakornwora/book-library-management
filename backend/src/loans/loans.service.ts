import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  borrow(
    bookId: string,
    userId: string,
    borrowedAt?: string,
    dueDate?: string,
  ) {
    const borrowedAtDate = borrowedAt ? new Date(borrowedAt) : new Date();
    const dueDateValue = dueDate ? new Date(dueDate) : null;
    if (!dueDateValue) {
      throw new BadRequestException('Due date is required');
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.book.updateMany({
        where: { id: bookId, availableQty: { gt: 0 } },
        data: { availableQty: { decrement: 1 } },
      });

      if (updated.count === 0) {
        throw new BadRequestException('Book not available');
      }

      return tx.loan.create({
        data: {
          bookId,
          userId,
          borrowedAt: borrowedAtDate,
          dueDate: dueDateValue,
        },
      });
    });
  }

  returnLoan(loanId: string, userId: string, returnedAt?: string) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { id: loanId, userId, returnedAt: null },
      });
      if (!loan)
        throw new BadRequestException('Loan not found or already returned');

      await tx.loan.update({
        where: { id: loanId },
        data: { returnedAt: returnedAt ? new Date(returnedAt) : new Date() },
      });

      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableQty: { increment: 1 } },
      });

      return { ok: true };
    });
  }

  returnByBook(bookId: string, userId: string, returnedAt?: string) {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findFirst({
        where: { bookId, userId, returnedAt: null },
        orderBy: { borrowedAt: 'desc' },
      });
      if (!loan)
        throw new BadRequestException('Loan not found or already returned');

      await tx.loan.update({
        where: { id: loan.id },
        data: { returnedAt: returnedAt ? new Date(returnedAt) : new Date() },
      });

      await tx.book.update({
        where: { id: loan.bookId },
        data: { availableQty: { increment: 1 } },
      });

      return { ok: true };
    });
  }

  listMyActive(userId: string) {
    return this.prisma.loan.findMany({
      where: { userId, returnedAt: null },
      orderBy: { borrowedAt: 'desc' },
    });
  }

  async listMyHistory(userId: string, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, pageSize));
    const skip = (safePage - 1) * safeSize;

    const where = { userId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({
        where,
        orderBy: { borrowedAt: 'desc' },
        skip,
        take: safeSize,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          book: { select: { id: true, title: true, author: true } },
        },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { items, total, page: safePage, pageSize: safeSize };
  }

  async listHistory(userId: string, role: Role, page = 1, pageSize = 20) {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, pageSize));
    const skip = (safePage - 1) * safeSize;

    let where: any = {};
    if (role === Role.MEMBER) {
      where = { userId };
    } else if (role === Role.LIBRARIAN) {
      where = {
        OR: [{ userId }, { user: { role: Role.MEMBER } }],
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.loan.findMany({
        where,
        orderBy: { borrowedAt: 'desc' },
        skip,
        take: safeSize,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          book: { select: { id: true, title: true, author: true } },
        },
      }),
      this.prisma.loan.count({ where }),
    ]);

    return { items, total, page: safePage, pageSize: safeSize };
  }
}
