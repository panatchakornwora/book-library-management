import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() author: string;
  @ApiProperty() @IsString() isbn: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  publicationYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ example: 3 }) @IsInt() @Min(0) totalQty: number;
}
