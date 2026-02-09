import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserResponse } from '../dto/user-response.dto';

export function GetUserDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get current user' }),
    ApiOkResponse({ type: UserResponse }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
