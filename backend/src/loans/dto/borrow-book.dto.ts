import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class BorrowBookDto {
  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  borrowedAt?: string;

  @ApiProperty({ example: '2025-01-15T00:00:00.000Z' })
  @IsDateString()
  dueDate: string;
}
