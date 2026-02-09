import { ApiProperty } from '@nestjs/swagger';
import { BookResponse } from './book-response.dto';

export class MostBorrowedItem {
  @ApiProperty({ type: BookResponse })
  book: BookResponse;

  @ApiProperty({ example: 12 })
  borrowCount: number;
}

export class MostBorrowedResponse {
  @ApiProperty({ type: [MostBorrowedItem] })
  items: MostBorrowedItem[];
}
