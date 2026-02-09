import { ApiProperty } from '@nestjs/swagger';

export class ReturnLoanResponse {
  @ApiProperty({ example: true })
  ok: boolean;
}
