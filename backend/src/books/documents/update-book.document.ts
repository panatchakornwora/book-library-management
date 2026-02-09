import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateBookDto } from '../dto/update-book.dto';
import { BookResponse } from '../dto/book-response.dto';

export function UpdateBookDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update book' }),
    ApiParam({
      name: 'id',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiBody({ type: UpdateBookDto }),
    ApiOkResponse({ type: BookResponse }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Book not found' }),
  );
}
