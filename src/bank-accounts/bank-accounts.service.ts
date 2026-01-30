import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

/** DTO com camelCase ou snake_case (frontend pode enviar ambos). */
type DtoWithAliases = CreateBankAccountDto & {
  account_type?: string | null;
  opening_balance?: number | string | null;
  opening_balance_date?: string | null;
  is_active?: boolean | null;
  account_number?: string | null;
};

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
    const name = (dto.name ?? '').trim();
    if (!name) throw new BadRequestException('name é obrigatório');

    const payload = dto as DtoWithAliases;
    const accountType = (payload.accountType ?? payload.account_type ?? '').toString().trim();
    const isActive = payload.isActive ?? payload.is_active ?? true;
    const institution = (payload.institution ?? '').toString().trim();
    const agency = (payload.agency ?? '').toString().trim();
    const accountNumber = (payload.accountNumber ?? payload.account_number ?? '').toString().trim();

    const openingBalance = toDecimal(payload.openingBalance ?? payload.opening_balance);
    const openingBalanceDate = toDateOnly(payload.openingBalanceDate ?? payload.opening_balance_date);

    return this.prisma.bankAccount.create({
      data: {
        companyId,
        name,
        institution: institution || '',
        accountType: accountType || '',
        openingBalance: openingBalance ?? undefined,
        openingBalanceDate: openingBalanceDate ?? undefined,
        isActive,
        agency: agency || '',
        accountNumber: accountNumber || '',
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

    const payload = dto as DtoWithAliases;
    const data: Record<string, unknown> = {};

    if (payload.name !== undefined) {
      const name = (payload.name ?? '').trim();
      if (!name) throw new BadRequestException('name não pode ser vazio');
      data.name = name;
    }
    if (payload.institution !== undefined)
      data.institution = (payload.institution ?? '').toString().trim() || '';
    if (payload.accountType !== undefined || payload.account_type !== undefined)
      data.accountType = (payload.accountType ?? payload.account_type ?? '').toString().trim() || '';
    if (payload.openingBalance !== undefined || payload.opening_balance !== undefined)
      data.openingBalance = toDecimal(payload.openingBalance ?? payload.opening_balance) ?? undefined;
    if (payload.openingBalanceDate !== undefined || payload.opening_balance_date !== undefined)
      data.openingBalanceDate = toDateOnly(payload.openingBalanceDate ?? payload.opening_balance_date) ?? undefined;
    if (payload.isActive !== undefined || payload.is_active !== undefined)
      data.isActive = payload.isActive ?? payload.is_active ?? true;
    if (payload.agency !== undefined)
      data.agency = (payload.agency ?? '').toString().trim() || '';
    if (payload.accountNumber !== undefined || payload.account_number !== undefined)
      data.accountNumber = (payload.accountNumber ?? payload.account_number ?? '').toString().trim() || '';

    return this.prisma.bankAccount.update({
      where: { id },
      data,
    });
  }
}

/** Converte number ou string para string (Prisma Decimal aceita string). Retorna null se não informado. */
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

/** Converte ISO/YYYY-MM-DD para Date (Prisma @db.Date guarda só a data). Retorna null se não informado. */
function toDateOnly(value: string | null | undefined): Date | null {
  if (value === null || value === undefined || String(value).trim() === '')
    return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
