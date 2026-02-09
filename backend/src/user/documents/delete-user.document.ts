import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

export function DeleteUserDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete user' }),
    ApiParam({ name: 'id', type: String, description: 'User id' }),
    ApiNoContentResponse({ description: 'User deleted' }),
  );
}
