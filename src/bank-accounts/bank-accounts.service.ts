import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BankAccountType, Prisma } from '@prisma/client';
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

/** Converte string do DTO para enum Prisma. */
function toBankAccountType(v: string | null | undefined): BankAccountType {
  const s = (v ?? '').toString().trim().toLowerCase();
  if (s === 'savings') return BankAccountType.savings;
  if (s === 'cash') return BankAccountType.cash;
  return BankAccountType.checking;
}

/** Registro de conta bancária como retornado pelo Prisma. */
type BankAccountRecord = {
  id: string;
  companyId: string;
  name: string;
  institution: string;
  accountType: BankAccountType | string;
  openingBalance: Prisma.Decimal | null;
  openingBalanceDate: Date | null;
  isActive: boolean;
  agency: string;
  accountNumber: string;
  createdAt: Date;
};

/** Serializa openingBalance (Decimal) e openingBalanceDate (Date) para JSON amigável ao frontend. */
function toBankAccountResponse(record: BankAccountRecord) {
  return {
    ...record,
    openingBalance:
      record.openingBalance != null ? Number(record.openingBalance) : null,
    openingBalanceDate: record.openingBalanceDate
      ? record.openingBalanceDate.toISOString().slice(0, 10)
      : null,
  };
}

@Injectable()
export class BankAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    const rows = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toBankAccountResponse);
  }

  /**
   * Overview: contas ativas com saldo atual (opening_balance + net movements).
   * currentBalance em reais (2 casas); movementsInCents e movementsOutCents por conta.
   */
  async overview(companyId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (accounts.length === 0) return [];

    const ids = accounts.map((a) => a.id);

    const [inGroups, outGroups] = await Promise.all([
      this.prisma.movement.groupBy({
        by: ['bankAccountId'],
        where: {
          companyId,
          bankAccountId: { in: ids },
          direction: 'in',
        },
        _sum: { amountCents: true },
      }),
      this.prisma.movement.groupBy({
        by: ['bankAccountId'],
        where: {
          companyId,
          bankAccountId: { in: ids },
          direction: 'out',
        },
        _sum: { amountCents: true },
      }),
    ]);

    const inByAccount = new Map<string, number>();
    for (const g of inGroups) {
      if (g.bankAccountId != null)
        inByAccount.set(g.bankAccountId, g._sum.amountCents ?? 0);
    }
    const outByAccount = new Map<string, number>();
    for (const g of outGroups) {
      if (g.bankAccountId != null)
        outByAccount.set(g.bankAccountId, g._sum.amountCents ?? 0);
    }

    return accounts.map((row) => {
      const movementsInCents = inByAccount.get(row.id) ?? 0;
      const movementsOutCents = outByAccount.get(row.id) ?? 0;
      const opening =
        row.openingBalance != null ? Number(row.openingBalance) : 0;
      const netReais = (movementsInCents - movementsOutCents) / 100;
      const currentBalance = Math.round((opening + netReais) * 100) / 100;

      return {
        id: row.id,
        name: row.name,
        institution: row.institution,
        accountType: row.accountType,
        agency: row.agency,
        accountNumber: row.accountNumber,
        openingBalance:
          row.openingBalance != null ? Number(row.openingBalance) : null,
        openingBalanceDate: row.openingBalanceDate
          ? row.openingBalanceDate.toISOString().slice(0, 10)
          : null,
        currentBalance,
        movementsInCents,
        movementsOutCents,
      };
    });
  }

  async getById(companyId: string, id: string) {
    const row = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
    });
    if (!row) {
      throw new NotFoundException(
        'Conta bancária não encontrada ou não pertence à empresa',
      );
    }
    return toBankAccountResponse(row as BankAccountRecord);
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

    const created = await this.prisma.bankAccount.create({
      data: {
        companyId,
        name,
        institution: institution || '',
        accountType: toBankAccountType(accountType || ''),
        openingBalance: openingBalance ?? undefined,
        openingBalanceDate: openingBalanceDate ?? undefined,
        isActive,
        agency: agency || '',
        accountNumber: accountNumber || '',
      },
    });
    return toBankAccountResponse(created as BankAccountRecord);
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
      data.accountType = toBankAccountType(payload.accountType ?? payload.account_type ?? '');
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

    const updated = await this.prisma.bankAccount.update({
      where: { id },
      data,
    });
    return toBankAccountResponse(updated as BankAccountRecord);
  }

  /** Soft delete: marca isActive=false. Não apaga fisicamente (preserva FK de movements). */
  async remove(companyId: string, id: string) {
    const existing = await this.prisma.bankAccount.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Conta bancária não encontrada ou não pertence à empresa',
      );
    }
    const updated = await this.prisma.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });
    return toBankAccountResponse(updated as BankAccountRecord);
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
