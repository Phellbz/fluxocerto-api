import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(companyId: string, dto: CreateBankAccountDto) {
    const name = dto.name.trim();
    if (!name) throw new BadRequestException('name é obrigatório');

    return this.prisma.bankAccount.create({
      data: {
        companyId,
        name,
        institution: dto.institution?.trim() ?? null,
        accountType: dto.accountType?.trim() ?? null,
        openingBalance: toDecimal(dto.openingBalance),
        openingBalanceDate: toDateOnly(dto.openingBalanceDate),
        isActive: dto.isActive ?? null,
        agency: dto.agency?.trim() ?? null,
        accountNumber: dto.accountNumber?.trim() ?? null,
      },
    });
  }

  async update(companyId: string, id: string, dto: UpdateBankAccountDto) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Conta bancária não encontrada ou não pertence à empresa',
      );
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (!name) throw new BadRequestException('name não pode ser vazio');
      data.name = name;
    }
    if (dto.institution !== undefined)
      data.institution = dto.institution?.trim() ?? null;
    if (dto.accountType !== undefined)
      data.accountType = dto.accountType?.trim() ?? null;
    if (dto.openingBalance !== undefined)
      data.openingBalance = toDecimal(dto.openingBalance);
    if (dto.openingBalanceDate !== undefined)
      data.openingBalanceDate = toDateOnly(dto.openingBalanceDate);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.agency !== undefined) data.agency = dto.agency?.trim() ?? null;
    if (dto.accountNumber !== undefined)
      data.accountNumber = dto.accountNumber?.trim() ?? null;

    return this.prisma.bankAccount.update({
      where: { id },
      data,
    });
  }
}

/** Converte number ou string para string (Prisma Decimal aceita string). */
function toDecimal(value: number | string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return String(value);
  }
  const s = String(value).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : null;
}

/** Converte ISO/YYYY-MM-DD para Date (Prisma @db.Date guarda só a data). */
function toDateOnly(value: string | null | undefined): Date | null {
  if (value === null || value === undefined || String(value).trim() === '')
    return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
