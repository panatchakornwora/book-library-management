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
import { UpdateBookQuantityDto } from '../dto/update-book-quantity.dto';
import { BookResponse } from '../dto/book-response.dto';

export function UpdateBookQuantityDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Remove book quantity' }),
    ApiParam({
      name: 'id',
      description: 'Book id',
      type: String,
      required: true,
    }),
    ApiBody({ type: UpdateBookQuantityDto }),
    ApiOkResponse({ type: BookResponse }),
    ApiBadRequestResponse({
      description: 'Cannot delete more than available quantity',
    }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
