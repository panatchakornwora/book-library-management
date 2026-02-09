import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { LoginResponse } from '../dto/auth-response.dto';

export function LoginDocument() {
  return applyDecorators(
    ApiOperation({ summary: 'Login' }),
    ApiBody({ type: LoginDto }),
    ApiOkResponse({ type: LoginResponse }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiNotFoundResponse({ description: 'User not found' }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
}
