import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: 'user_1' })
  id: string;

  @ApiProperty({ example: 'Somchai' })
  name: string;

  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;
}
