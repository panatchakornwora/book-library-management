import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoanResponse } from '../dto/loan-response.dto';
import { BorrowBookDto } from '../dto/borrow-book.dto';

export function BorrowBookDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Borrow book' }),
    ApiParam({
      name: 'bookId',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiBody({ type: BorrowBookDto }),
    ApiCreatedResponse({ type: LoanResponse }),
    ApiBadRequestResponse({
      description: 'Book not available or due date missing',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
