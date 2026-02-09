import { ApiProperty } from '@nestjs/swagger';

class LoanHistoryUser {
  @ApiProperty({ example: 'user_1' })
  id: string;

  @ApiProperty({ example: 'Somchai' })
  name: string;

  @ApiProperty({ example: 'member@test.com' })
  email: string;

  @ApiProperty({ example: 'MEMBER' })
  role: string;
}

class LoanHistoryBook {
  @ApiProperty({ example: 'book_1' })
  id: string;

  @ApiProperty({ example: 'Clean Code' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author: string;
}

class LoanHistoryItem {
  @ApiProperty({ example: 'loan_1' })
  id: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  borrowedAt: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z', nullable: true })
  dueDate: string | null;

  @ApiProperty({ example: null, nullable: true })
  returnedAt: string | null;

  @ApiProperty({ type: LoanHistoryUser })
  user: LoanHistoryUser;

  @ApiProperty({ type: LoanHistoryBook })
  book: LoanHistoryBook;
}

export class LoanHistoryResponse {
  @ApiProperty({ type: [LoanHistoryItem] })
  items: LoanHistoryItem[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;
}
