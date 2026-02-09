import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginDocument } from './documents/login.document';
import { LogoutDocument } from './documents/logout.document';
import { RefreshDocument } from './documents/refresh.document';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUserPayload } from './auth.types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @LoginDocument()
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto.email, dto.password);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @LogoutDocument()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.logout(req.user as AuthUserPayload);
    res.clearCookie('refreshToken', this.getCookieOptions());
    return result;
  }

  @Post('refresh')
  @RefreshDocument()
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken ?? '';
    const result = await this.auth.refresh(refreshToken);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie('refreshToken', token, this.getCookieOptions());
  }

  private getCookieOptions() {
    const days = Number(process.env.REFRESH_TOKEN_DAYS) || 7;
    return {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: days * 24 * 60 * 60 * 1000,
      path: '/',
    };
  }
}
