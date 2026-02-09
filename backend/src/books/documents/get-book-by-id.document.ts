import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { BookResponse } from '../dto/book-response.dto';

export function GetBookByIdDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Get book by id' }),
    ApiParam({
      name: 'id',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiOkResponse({ type: BookResponse }),
    ApiNotFoundResponse({ description: 'Book not found' }),
  );
}
