import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('bootstrap-system')
  async bootstrapSystem(
    @Headers('x-admin-bootstrap-secret') secret: string | undefined,
    @Body() body: { email: string; password: string; name: string },
  ) {
    const expected = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
    if (!expected || (secret ?? '').trim() !== expected) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }

    const email = (body.email ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim() || email;
    const password = body.password;
    if (!email) {
      throw new UnauthorizedException('email is required');
    }
    if (!password || String(password).length < 6) {
      throw new UnauthorizedException('password must be at least 6 characters');
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const existing = await this.prisma.appUser.findUnique({
      where: { email },
    });

    if (existing) {
      await this.prisma.appUser.update({
        where: { id: existing.id },
        data: {
          isSystemAdmin: true,
          mustChangePassword: false,
        },
      });
      return {
        ok: true,
        message: 'System admin updated',
        userId: existing.id,
        email: existing.email,
      };
    }

    const created = await this.prisma.appUser.create({
      data: {
        email,
        name,
        passwordHash,
        isSystemAdmin: true,
        mustChangePassword: false,
      },
    });
    return {
      ok: true,
      message: 'System admin created',
      userId: created.id,
      email: created.email,
    };
  }
}
