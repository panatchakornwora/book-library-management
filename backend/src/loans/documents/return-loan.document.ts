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
import { ReturnLoanResponse } from '../dto/return-loan-response.dto';
import { ReturnLoanDto } from '../dto/return-loan.dto';

export function ReturnLoanDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Return loan' }),
    ApiParam({
      name: 'loanId',
      description: 'Loan id',
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
