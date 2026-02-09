import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoanResponse } from '../dto/loan-response.dto';

export function ListMyLoansDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List my active loans' }),
    ApiOkResponse({ type: LoanResponse, isArray: true }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
