import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CompanyRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const VALID_ROLES: CompanyRole[] = ['master', 'owner', 'admin', 'financeiro', 'estoque', 'member'];
const DEFAULT_TEMP_PASSWORD_LENGTH = 12;

function generateTempPassword(length = DEFAULT_TEMP_PASSWORD_LENGTH): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
}

function toCompanyRole(value: string): CompanyRole {
  const r = (value ?? '').trim().toLowerCase();
  if (VALID_ROLES.includes(r as CompanyRole)) return r as CompanyRole;
  throw new BadRequestException(`role deve ser um de: ${VALID_ROLES.join(', ')}`);
}

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async addMember(
    companyId: string,
    body: { name: string; email: string; role: string; tempPassword?: string },
  ): Promise<{ userId: string; tempPassword?: string }> {
    const email = (body.email ?? '').trim().toLowerCase();
    const name = (body.name ?? '').trim();
    const role = toCompanyRole(body.role);
    const tempPassword = body.tempPassword?.trim() || generateTempPassword();

    const existingUser = await this.prisma.appUser.findUnique({
      where: { email },
    });

    let userId: string;
    let returnTempPassword: string | undefined;

    if (existingUser) {
      userId = existingUser.id;
      const existingMember = await this.prisma.companyMember.findUnique({
        where: { companyId_userId: { companyId, userId } },
      });
      if (existingMember) {
        throw new ConflictException('Usuário já é membro desta empresa');
      }
    } else {
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      const created = await this.prisma.appUser.create({
        data: {
          email,
          name: name || email,
          passwordHash,
          isActive: true,
          mustChangePassword: true,
        },
      });
      userId = created.id;
      returnTempPassword = tempPassword;
    }

    await this.prisma.companyMember.create({
      data: { companyId, userId, role, isActive: true },
    });

    return {
      userId,
      ...(returnTempPassword !== undefined && { tempPassword: returnTempPassword }),
    };
  }

  async listMembers(companyId: string) {
    const members = await this.prisma.companyMember.findMany({
      where: { companyId },
      include: {
        user: {
          select: { id: true, email: true, name: true, isActive: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      isActive: m.isActive,
      email: m.user.email,
      name: m.user.name,
      userActive: m.user.isActive,
    }));
  }
}
