import { ApiProperty } from '@nestjs/swagger';

export class BookResponse {
  @ApiProperty({ example: 'book_1' })
  id: string;

  @ApiProperty({ example: 'Clean Architecture' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author: string;

  @ApiProperty({ example: '9780134494166' })
  isbn: string;

  @ApiProperty({ example: 2017, nullable: true })
  publicationYear: number | null;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  coverUrl: string | null;

  @ApiProperty({ example: 3 })
  totalQty: number;

  @ApiProperty({ example: 2 })
  availableQty: number;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt: string;
}
