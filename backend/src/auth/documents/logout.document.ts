import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LogoutResponse } from '../dto/auth-response.dto';

export function LogoutDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Logout' }),
    ApiBearerAuth(),
    ApiOkResponse({ type: LogoutResponse }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
