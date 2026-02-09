import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateBookQuantityDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
