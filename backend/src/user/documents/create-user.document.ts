import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponse } from '../dto/user-response.dto';

export function CreateUserDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create user' }),
    ApiBody({ type: CreateUserDto }),
    ApiCreatedResponse({ type: UserResponse }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden' }),
  );
}
