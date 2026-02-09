import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function DeleteBookDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete book' }),
    ApiParam({
      name: 'id',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiNoContentResponse({ description: 'Deleted' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiNotFoundResponse({ description: 'Book not found' }),
  );
}
