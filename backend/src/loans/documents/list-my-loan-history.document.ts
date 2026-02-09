import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoanHistoryResponse } from '../dto/loan-history-response.dto';

export function ListMyLoanHistoryDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List my loan history' }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number (default 1)',
      type: Number,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Page size (default 20)',
      type: Number,
    }),
    ApiOkResponse({ type: LoanHistoryResponse }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
