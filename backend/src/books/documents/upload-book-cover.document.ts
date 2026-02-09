import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UploadCoverResponse } from '../dto/upload-cover-response.dto';

export function UploadBookCoverDocument() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Upload book cover image' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary' },
        },
        required: ['file'],
      },
    }),
    ApiOkResponse({ type: UploadCoverResponse }),
  );
}
