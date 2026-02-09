import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BookListResponse } from '../dto/book-list-response.dto';

export function GetBookListDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'List books' }),
    ApiQuery({
      name: 'query',
      required: false,
      description: 'Search by title or author',
      type: String,
    }),
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
    ApiOkResponse({ type: BookListResponse }),
  );
}
