import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Controller('me')
export class MeController {
  constructor(private readonly jwt: JwtService) {}

  @Get('companies')
  async companies(@Headers('authorization') authorization?: string) {
    const token = (authorization || '').replace('Bearer ', '').trim();
    if (!token) throw new UnauthorizedException('Missing token');

    const payload = await this.jwt.verifyAsync(token, {
      secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    });

    return [{ id: payload.company_id, name: 'Minha Empresa' }];
  }
}
