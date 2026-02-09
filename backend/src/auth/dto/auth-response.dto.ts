import { ApiProperty } from '@nestjs/swagger';

class AuthUserResponse {
  @ApiProperty({ example: 'user_1' })
  id: string;

  @ApiProperty({ example: 'admin@test.com' })
  email: string;

  @ApiProperty({ example: 'ADMIN' })
  role: string;
}

export class LoginResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ type: AuthUserResponse })
  user: AuthUserResponse;
}

export class LogoutResponse {
  @ApiProperty({ example: 'Logged out' })
  message: string;
}

export class RefreshResponse {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
