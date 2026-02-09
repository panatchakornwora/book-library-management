import { ApiProperty } from '@nestjs/swagger';

export class UploadCoverResponse {
  @ApiProperty({
    example: 'https://bucket.s3.region.amazonaws.com/covers/uuid.jpg',
  })
  url: string;
}
