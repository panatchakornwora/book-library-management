import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ReturnLoanDto {
  @ApiPropertyOptional({ example: '2025-01-02T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  returnedAt?: string;
}
