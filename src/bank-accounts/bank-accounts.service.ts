import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BankAccountType, MovementStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

/** Garante número válido (0 se nulo/NaN). */
function safeNum(v: number | null | undefined): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

/** Resposta do GET /bank-accounts/balances */
export interface BankBalancesResponse {
  totalCashToday: number;
  /** Totais globais (para dashboard cash-today). */
  openingBalanceTotal?: number;
  movementsInTotal?: number;
  movementsOutTotal?: number;
  accounts: Array<{
    id: string;
    name: string;
    institution: string | null;
    agency: string | null;
    accountNumber: string | null;
    accountType: string | null;
    openingBalance: number;
    openingBalanceDate: string | null;
    currentBalance: number;
  }>;
}

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

  /**
   * Lista contas ativas com currentBalance.
   * Regra: currentBalance = openingBalance + entradas(realized) - saídas(realized).
   * Considera apenas movements com status REALIZED e bankAccountId preenchido.
   */
  async list(companyId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (accounts.length === 0) return [];

    const movementsAgg = await this.prisma.movement.groupBy({
      by: ['bankAccountId', 'direction'],
      where: {
        companyId,
        status: MovementStatus.REALIZED,
        bankAccountId: { not: null },
      },
      _sum: { amountCents: true },
    });

    const movementMap = new Map<string, { in: number; out: number }>();
    movementsAgg.forEach((m) => {
      if (m.bankAccountId == null) return;
      if (!movementMap.has(m.bankAccountId)) {
        movementMap.set(m.bankAccountId, { in: 0, out: 0 });
      }
      const entry = movementMap.get(m.bankAccountId)!;
      if (m.direction === 'in') {
        entry.in = safeNum(m._sum.amountCents);
      } else {
        entry.out = safeNum(m._sum.amountCents);
      }
    });

    return accounts.map((acc) => {
      const mov = movementMap.get(acc.id) ?? { in: 0, out: 0 };
      const openingCents = Math.round(safeNum(Number(acc.openingBalance ?? 0)) * 100);
      const currentBalanceCents = openingCents + mov.in - mov.out;
      return {
        ...toBankAccountResponse(acc as BankAccountRecord),
        currentBalance: Math.round(currentBalanceCents) / 100,
      };
    });
  }

  /**
   * Overview: contas ativas com saldo atual (mesma regra de list: apenas movements realized).
   * currentBalance em reais; movementsInCents e movementsOutCents por conta.
   */
  async overview(companyId: string) {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    if (accounts.length === 0) return [];

    const movementsAgg = await this.prisma.movement.groupBy({
      by: ['bankAccountId', 'direction'],
      where: {
        companyId,
        status: MovementStatus.REALIZED,
        bankAccountId: { not: null },
      },
      _sum: { amountCents: true },
    });

    const movementMap = new Map<string, { in: number; out: number }>();
    movementsAgg.forEach((m) => {
      if (m.bankAccountId == null) return;
      if (!movementMap.has(m.bankAccountId)) {
        movementMap.set(m.bankAccountId, { in: 0, out: 0 });
      }
      const entry = movementMap.get(m.bankAccountId)!;
      if (m.direction === 'in') {
        entry.in = safeNum(m._sum.amountCents);
      } else {
        entry.out = safeNum(m._sum.amountCents);
      }
    });

    return accounts.map((row) => {
      const mov = movementMap.get(row.id) ?? { in: 0, out: 0 };
      const opening = safeNum(Number(row.openingBalance ?? 0));
      const currentBalance =
        Math.round((opening * 100 + mov.in - mov.out)) / 100;

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
        movementsInCents: mov.in,
        movementsOutCents: mov.out,
      };
    });
  }

  /**
   * Saldos por conta ativa e total. Usado por GET /bank-accounts/balances e dashboard cash-today.
   * currentBalance = openingBalance + SUM(entradas REALIZED) - SUM(saídas REALIZED).
   * Sempre retorna números (0 se nulo) para evitar NaN.
   */
  async getBalances(companyId: string): Promise<BankBalancesResponse> {
    const accounts = await this.prisma.bankAccount.findMany({
      where: { companyId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (accounts.length === 0) {
      return { totalCashToday: 0, accounts: [] };
    }

    const movementsAgg = await this.prisma.movement.groupBy({
      by: ['bankAccountId', 'direction'],
      where: {
        companyId,
        status: MovementStatus.REALIZED,
        bankAccountId: { not: null },
      },
      _sum: { amountCents: true },
    });

    const movementMap = new Map<string, { in: number; out: number }>();
    movementsAgg.forEach((m) => {
      if (m.bankAccountId == null) return;
      if (!movementMap.has(m.bankAccountId)) {
        movementMap.set(m.bankAccountId, { in: 0, out: 0 });
      }
      const entry = movementMap.get(m.bankAccountId)!;
      if (m.direction === 'in') {
        entry.in = safeNum(m._sum.amountCents);
      } else {
        entry.out = safeNum(m._sum.amountCents);
      }
    });

    let totalCashTodayCents = 0;
    let openingBalanceTotal = 0;
    let movementsInTotalCents = 0;
    let movementsOutTotalCents = 0;

    const accountsList = accounts.map((acc) => {
      const mov = movementMap.get(acc.id) ?? { in: 0, out: 0 };
      const openingCents = Math.round(safeNum(Number(acc.openingBalance ?? 0)) * 100);
      const currentBalanceCents = openingCents + mov.in - mov.out;
      totalCashTodayCents += currentBalanceCents;
      openingBalanceTotal += safeNum(Number(acc.openingBalance ?? 0));
      movementsInTotalCents += mov.in;
      movementsOutTotalCents += mov.out;
      const currentBalance = Math.round(currentBalanceCents) / 100;
      const openingBalance = safeNum(Number(acc.openingBalance ?? 0));

      return {
        id: acc.id,
        name: acc.name,
        institution: acc.institution?.trim() || null,
        agency: acc.agency?.trim() || null,
        accountNumber: acc.accountNumber?.trim() || null,
        accountType: acc.accountType,
        openingBalance,
        openingBalanceDate: acc.openingBalanceDate
          ? acc.openingBalanceDate.toISOString().slice(0, 10)
          : null,
        currentBalance,
      };
    });

    const totalCashToday = Math.round(totalCashTodayCents) / 100;
    return {
      totalCashToday,
      openingBalanceTotal: Math.round(openingBalanceTotal * 100) / 100,
      movementsInTotal: Math.round(movementsInTotalCents) / 100,
      movementsOutTotal: Math.round(movementsOutTotalCents) / 100,
      accounts: accountsList,
    };
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
