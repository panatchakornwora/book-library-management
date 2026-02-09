import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { UserResponse } from '../dto/user-response.dto';

export function ListUsersDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'List users' }),
    ApiOkResponse({ type: [UserResponse] }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  );
}
