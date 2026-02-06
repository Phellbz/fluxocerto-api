import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CompanyRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_TEMP_PASSWORD_LENGTH = 12;

function generateTempPassword(length = DEFAULT_TEMP_PASSWORD_LENGTH): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

@Injectable()
export class SystemService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bootstrap system admin. Idempotent: if user exists, return ok + userId without changing password.
   */
  async bootstrapSystemAdmin(
    secret: string | undefined,
    body: { email: string; name: string; password: string },
  ) {
    const expected = process.env.SYSTEM_ADMIN_BOOTSTRAP_SECRET?.trim();
    if (!expected || (secret ?? '').trim() !== expected) {
      throw new UnauthorizedException('Invalid bootstrap secret');
    }
    const email = (body.email ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim() || email;
    const password = body.password;
    if (!email) throw new UnauthorizedException('email is required');
    if (!password || String(password).length < 6) {
      throw new UnauthorizedException('password must be at least 6 characters');
    }

    const existing = await this.prisma.appUser.findUnique({ where: { email } });
    if (existing) {
      return { ok: true, userId: existing.id };
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const created = await this.prisma.appUser.create({
      data: {
        email,
        name,
        passwordHash,
        isSystemAdmin: true,
        mustChangePassword: false,
      },
    });
    return { ok: true, userId: created.id };
  }

  /**
   * Create company + owner (system admin only). If owner user exists, do not change password.
   */
  async createCompanyWithOwner(
    body: {
      company: { name: string; document?: string };
      owner: { name: string; email: string };
      tempPassword?: string;
    },
  ): Promise<{
    companyId: string;
    ownerUserId: string;
    tempPassword?: string;
  }> {
    const companyName = (body.company.name ?? '').trim();
    const companyDocument = (body.company.document ?? '').trim() || null;
    const ownerName = (body.owner.name ?? '').trim();
    const ownerEmail = (body.owner.email ?? '').trim().toLowerCase();
    if (!companyName) throw new UnauthorizedException('company.name is required');
    if (!ownerEmail) throw new UnauthorizedException('owner.email is required');

    const tempPassword = body.tempPassword?.trim() || generateTempPassword();
    let ownerUserId: string;
    let returnTempPassword: string | undefined;

    const existingUser = await this.prisma.appUser.findUnique({
      where: { email: ownerEmail },
    });

    if (existingUser) {
      ownerUserId = existingUser.id;
    } else {
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const created = await this.prisma.appUser.create({
        data: {
          email: ownerEmail,
          name: ownerName || ownerEmail,
          passwordHash,
          isActive: true,
          mustChangePassword: true,
        },
      });
      ownerUserId = created.id;
      returnTempPassword = tempPassword;
    }

    const company = await this.prisma.company.create({
      data: {
        name: companyName,
        document: companyDocument,
        isActive: true,
      },
    });

    await this.prisma.companyMember.upsert({
      where: {
        companyId_userId: { companyId: company.id, userId: ownerUserId },
      },
      create: {
        companyId: company.id,
        userId: ownerUserId,
        role: CompanyRole.owner,
        isActive: true,
      },
      update: { role: CompanyRole.owner, isActive: true },
    });

    return {
      companyId: company.id,
      ownerUserId,
      ...(returnTempPassword !== undefined && { tempPassword: returnTempPassword }),
    };
  }
}
