import { ApiProperty } from '@nestjs/swagger';
import { BookResponse } from './book-response.dto';

export class BookListResponse {
  @ApiProperty({ type: [BookResponse] })
  items: BookResponse[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;
}
