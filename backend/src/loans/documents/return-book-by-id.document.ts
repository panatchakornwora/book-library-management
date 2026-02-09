import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReturnLoanDto } from '../dto/return-loan.dto';
import { ReturnLoanResponse } from '../dto/return-loan-response.dto';

export function ReturnBookByIdDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Return book (by bookId)' }),
    ApiParam({
      name: 'bookId',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiBody({ type: ReturnLoanDto }),
    ApiOkResponse({ type: ReturnLoanResponse }),
    ApiBadRequestResponse({
      description: 'Loan not found or already returned',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
