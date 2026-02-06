import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_MAX_AGE_SEC,
} from './cookie-options';

const REFRESH_COOKIE_NAME = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const meta = {
      userAgent: req.headers['user-agent'] ?? undefined,
      ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.socket?.remoteAddress,
    };
    const result = await this.auth.login(body.email, body.password, meta);
    if (!result) throw new UnauthorizedException('Invalid credentials');

    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_MAX_AGE_SEC * 1000,
    } as any);

    return {
      accessToken: result.accessToken,
      user: result.user,
      APP_SESSION_TOKEN: result.accessToken,
      APP_USER: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
  ) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const result = await this.auth.refresh(refreshToken);
    if (!result) {
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_MAX_AGE_SEC * 1000,
    } as any);
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await this.auth.logout(refreshToken ?? '');
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    return { ok: true };
  }

  @Post('first-access')
  async firstAccess(@Body() body: { email: string; tempPassword: string; newPassword: string }) {
    const result = await this.auth.firstAccess(
      body.email,
      body.tempPassword,
      body.newPassword,
    );
    if (!result) throw new UnauthorizedException('Credenciais temporárias inválidas');
    return result;
  }
}
