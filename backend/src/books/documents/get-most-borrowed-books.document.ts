import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { MostBorrowedResponse } from '../dto/most-borrowed-response.dto';

export function GetMostBorrowedBooksDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List most borrowed books' }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Max items (default 5)',
      type: Number,
    }),
    ApiOkResponse({ type: MostBorrowedResponse }),
  );
}
