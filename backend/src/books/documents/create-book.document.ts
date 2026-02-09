import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookResponse } from '../dto/book-response.dto';

export function CreateBookDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create book' }),
    ApiBody({ type: CreateBookDto }),
    ApiCreatedResponse({ type: BookResponse }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
