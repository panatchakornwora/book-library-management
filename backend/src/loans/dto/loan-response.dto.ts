import { ApiProperty } from '@nestjs/swagger';

export class LoanResponse {
  @ApiProperty({ example: 'loan_1' })
  id: string;

  @ApiProperty({ example: 'user_1' })
  userId: string;

  @ApiProperty({ example: 'book_1' })
  bookId: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  borrowedAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z', nullable: true })
  dueDate: string | null;

  @ApiProperty({ example: null, nullable: true })
  returnedAt: string | null;
}
