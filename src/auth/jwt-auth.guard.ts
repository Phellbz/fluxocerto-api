import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = (req.headers['authorization'] || '') as string;

    const token = auth.replace('Bearer ', '').trim();
    if (!token) throw new UnauthorizedException('Missing token');

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
