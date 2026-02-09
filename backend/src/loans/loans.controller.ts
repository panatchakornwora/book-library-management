import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BorrowBookDocument } from './documents/borrow-book.document';
import { ReturnBookByIdDocument } from './documents/return-book-by-id.document';
import { LoansService } from './loans.service';
import { ReturnLoanDocument } from './documents/return-loan.document';
import { BorrowBookDto } from './dto/borrow-book.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { ListMyLoansDocument } from './documents/list-my-loans.document';
import { ListLoanHistoryDocument } from './documents/list-loan-history.document';
import { ListMyLoanHistoryDocument } from './documents/list-my-loan-history.document';

type RequestWithUser = { user: { userId: string; role?: string } };

@ApiTags('loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private loans: LoansService) {}

  @Get('my')
  @ListMyLoansDocument()
  myLoans(@Req() req: RequestWithUser) {
    return this.loans.listMyActive(req.user.userId);
  }

  @Get('my-history')
  @ListMyLoanHistoryDocument()
  myHistory(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 20;
    return this.loans.listMyHistory(req.user.userId, p, ps);
  }

  @Get('history')
  @ListLoanHistoryDocument()
  history(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? Number(page) : 1;
    const ps = pageSize ? Number(pageSize) : 20;
    return this.loans.listHistory(req.user.userId, req.user.role as any, p, ps);
  }

  @Post('borrow/:bookId')
  @BorrowBookDocument()
  borrow(
    @Param('bookId') bookId: string,
    @Body() dto: BorrowBookDto,
    @Req() req: RequestWithUser,
  ) {
    return this.loans.borrow(
      bookId,
      req.user.userId,
      dto.borrowedAt,
      dto.dueDate,
    );
  }

  @Post('return/:loanId')
  @ReturnLoanDocument()
  returnLoan(
    @Param('loanId') loanId: string,
    @Body() dto: ReturnLoanDto,
    @Req() req: RequestWithUser,
  ) {
    return this.loans.returnLoan(loanId, req.user.userId, dto.returnedAt);
  }

  @Post('return/book/:bookId')
  @ReturnBookByIdDocument()
  returnByBook(
    @Param('bookId') bookId: string,
    @Body() dto: ReturnLoanDto,
    @Req() req: RequestWithUser,
  ) {
    return this.loans.returnByBook(bookId, req.user.userId, dto.returnedAt);
  }
}
