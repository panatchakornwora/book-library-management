import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RefreshResponse } from '../dto/auth-response.dto';

export function RefreshDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh access token' }),
    ApiCookieAuth('refreshToken'),
    ApiOkResponse({ type: RefreshResponse }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired refresh token',
    }),
  );
}
