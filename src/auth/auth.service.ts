import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_DAYS = 30;
const REFRESH_TOKEN_BYTES = 32;

function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(
    email: string,
    password: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const user = await this.prisma.appUser.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || !user.isActive) return null;

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return null;

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.refreshSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        userAgent: meta?.userAgent ?? null,
        ip: meta?.ip ?? null,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mustChangePassword: user.mustChangePassword,
        isSystemAdmin: user.isSystemAdmin,
      },
    };
  }

  async refresh(refreshTokenValue: string) {
    if (!refreshTokenValue?.trim()) return null;
    const tokenHash = hashRefreshToken(refreshTokenValue.trim());

    const session = await this.prisma.refreshSession.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      return null;
    }

    const user = session.user;
    const newRefreshToken = generateRefreshToken();
    const newHash = hashRefreshToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.prisma.$transaction(async (tx) => {
      const newSession = await tx.refreshSession.create({
        data: {
          userId: user.id,
          tokenHash: newHash,
          expiresAt,
        },
      });
      await tx.refreshSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date(), replacedById: newSession.id },
      });
    });

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshTokenValue: string): Promise<void> {
    if (!refreshTokenValue?.trim()) return;
    const tokenHash = hashRefreshToken(refreshTokenValue.trim());
    await this.prisma.refreshSession.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }
}
