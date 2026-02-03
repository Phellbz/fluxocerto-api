import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  BudgetStatus,
  BudgetItemType,
  FinancialAccountStatus,
  InstallmentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetItemInputDto } from './dto/budget-item-input.dto';

const USER_PLACEHOLDER = 'system';

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

function toDateOnly(value: string | null | undefined): Date | null {
  if (value === null || value === undefined || String(value).trim() === '')
    return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function str(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function toBudgetStatus(v: string | null | undefined): BudgetStatus {
  const s = (v ?? '').toString().trim().toLowerCase();
  if (s === 'sent') return BudgetStatus.sent;
  if (s === 'approved' || s === 'aprovado') return BudgetStatus.approved;
  if (s === 'canceled' || s === 'cancelled') return BudgetStatus.canceled;
  return BudgetStatus.draft;
}

function toBudgetItemType(v: string | null | undefined): BudgetItemType {
  const s = (v ?? '').toString().trim().toLowerCase();
  return s === 'material' ? BudgetItemType.material : BudgetItemType.service;
}

function buildBudgetData(
  dto: CreateBudgetDto | UpdateBudgetDto,
  companyId: string,
  userId: string | null,
): Prisma.BudgetUncheckedCreateInput {
  const uid = userId ?? USER_PLACEHOLDER;
  const budgetNumber = str(dto.budgetNumber) ?? '';
  const totalAmount = toDecimal(dto.totalAmount);
  return {
    companyId,
    budgetNumber,
    status: dto.status !== undefined ? toBudgetStatus(dto.status) : BudgetStatus.draft,
    clientId: str(dto.clientId) ?? undefined,
    clientName: str(dto.clientName) ?? undefined,
    sellerName: str(dto.sellerName) ?? undefined,
    totalAmount: totalAmount ?? '0',
    totalServices: toDecimal(dto.totalServices) ?? '0',
    totalMaterials: toDecimal(dto.totalMaterials) ?? '0',
    discountValue: toDecimal(dto.discountValue) ?? '0',
    expectedBillingDate: toDateOnly(dto.expectedBillingDate) ?? undefined,
    installmentCount:
      dto.installmentCount != null && dto.installmentCount >= 1
        ? Number(dto.installmentCount)
        : 1,
    categoryId: str(dto.categoryId) ?? undefined,
    departmentId: str(dto.departmentId) ?? undefined,
    bankAccountId: str(dto.bankAccountId) ?? undefined,
    observations: str(dto.observations) ?? undefined,
    createdByUserId: uid,
    updatedByUserId: uid,
  };
}

function buildBudgetUpdateData(
  dto: UpdateBudgetDto,
  userId: string | null,
): Prisma.BudgetUncheckedUpdateInput {
  const uid = userId ?? USER_PLACEHOLDER;
  const data: Prisma.BudgetUncheckedUpdateInput = {
    updatedByUserId: uid,
  };
  if (dto.budgetNumber !== undefined) data.budgetNumber = str(dto.budgetNumber) ?? undefined;
  if (dto.status !== undefined) data.status = toBudgetStatus(dto.status);
  if (dto.clientId !== undefined) data.clientId = str(dto.clientId);
  if (dto.clientName !== undefined) data.clientName = str(dto.clientName);
  if (dto.sellerName !== undefined) data.sellerName = str(dto.sellerName);
  if (dto.totalAmount !== undefined) data.totalAmount = toDecimal(dto.totalAmount) ?? undefined;
  if (dto.totalServices !== undefined) data.totalServices = toDecimal(dto.totalServices) ?? undefined;
  if (dto.totalMaterials !== undefined) data.totalMaterials = toDecimal(dto.totalMaterials) ?? undefined;
  if (dto.discountValue !== undefined) data.discountValue = toDecimal(dto.discountValue) ?? undefined;
  if (dto.expectedBillingDate !== undefined) data.expectedBillingDate = toDateOnly(dto.expectedBillingDate);
  if (dto.installmentCount !== undefined) data.installmentCount = Number(dto.installmentCount);
  if (dto.categoryId !== undefined) data.categoryId = str(dto.categoryId);
  if (dto.departmentId !== undefined) data.departmentId = str(dto.departmentId);
  if (dto.bankAccountId !== undefined) data.bankAccountId = str(dto.bankAccountId);
  if (dto.observations !== undefined) data.observations = str(dto.observations);
  return data;
}

function buildItemRows(
  items: BudgetItemInputDto[] | undefined,
  companyId: string,
  budgetId: string,
  userId: string | null,
): Prisma.BudgetItemCreateManyInput[] {
  if (!items?.length) return [];
  const uid = userId ?? USER_PLACEHOLDER;
  return items.map((it) => ({
    companyId,
    budgetId,
    itemType: toBudgetItemType(it.itemType),
    productId: str(it.productId) ?? undefined,
    description: (str(it.description) ?? '').trim() || 'Item',
    quantity: toDecimal(it.quantity) ?? '0',
    unitPrice: toDecimal(it.unitPrice) ?? '0',
    discountPercent: toDecimal(it.discountPercent) ?? '0',
    lineTotal: toDecimal(it.lineTotal) ?? '0',
    createdByUserId: uid,
    updatedByUserId: uid,
  }));
}

/** Divide total em N parcelas iguais; última parcela ajusta centavos. */
function splitInstallments(
  totalCents: number,
  count: number,
): { amountCents: number }[] {
  if (count < 1) return [{ amountCents: totalCents }];
  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;
  const rows: { amountCents: number }[] = [];
  for (let i = 0; i < count; i++) {
    rows.push({
      amountCents: i < count - 1 ? base : base + remainder,
    });
  }
  return rows;
}

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.budget.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async getById(companyId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { items: true },
    });
    if (!budget) {
      throw new NotFoundException(
        'Orçamento não encontrado ou não pertence à empresa',
      );
    }
    return budget;
  }

  async create(
    companyId: string,
    userId: string | null,
    dto: CreateBudgetDto,
  ) {
    const budgetNumber = str(dto.budgetNumber);
    if (!budgetNumber) {
      throw new BadRequestException('budgetNumber é obrigatório');
    }
    const totalAmount = toDecimal(dto.totalAmount);
    const budgetData = {
      ...buildBudgetData(dto, companyId, userId),
      budgetNumber,
      totalAmount: totalAmount ?? '0',
    };

    const result = await this.prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({ data: budgetData });
      const itemRows = buildItemRows(dto.items, companyId, budget.id, userId);
      if (itemRows.length > 0) {
        await tx.budgetItem.createMany({ data: itemRows });
      }
      return tx.budget.findUniqueOrThrow({
        where: { id: budget.id },
        include: { items: true },
      });
    });

    return result;
  }

  async update(
    companyId: string,
    id: string,
    dto: UpdateBudgetDto,
    userId: string | null,
  ) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { items: true },
    });
    if (!existing) {
      throw new NotFoundException(
        'Orçamento não encontrado ou não pertence à empresa',
      );
    }

    const newStatus = dto.status !== undefined ? toBudgetStatus(dto.status) : existing.status;

    if (existing.status === BudgetStatus.approved) {
      if (newStatus !== BudgetStatus.canceled) {
        throw new BadRequestException(
          'Orçamento aprovado não pode ser editado. Cancele para criar um novo.',
        );
      }
      const updateData = buildBudgetUpdateData(dto, userId);
      const updated = await this.prisma.budget.update({
        where: { id },
        data: { ...updateData, status: BudgetStatus.canceled },
        include: { items: true },
      });
      return updated;
    }

    if (newStatus === BudgetStatus.approved) {
      if (!existing.clientId) {
        throw new BadRequestException(
          'clientId é obrigatório para aprovar o orçamento',
        );
      }
      const totalAmountNum = Number(existing.totalAmount);
      if (!Number.isFinite(totalAmountNum) || totalAmountNum <= 0) {
        throw new BadRequestException(
          'totalAmount deve ser maior que zero para aprovar',
        );
      }
      const uid = userId ?? USER_PLACEHOLDER;
      const issueDate = existing.expectedBillingDate
        ? new Date(existing.expectedBillingDate)
        : new Date();
      const issueDateOnly = new Date(
        Date.UTC(
          issueDate.getUTCFullYear(),
          issueDate.getUTCMonth(),
          issueDate.getUTCDate(),
        ),
      );
      const installmentCount = Math.max(1, existing.installmentCount ?? 1);
      const totalCents = Math.round(totalAmountNum * 100);
      const installmentsAmounts = splitInstallments(totalCents, installmentCount);

      const result = await this.prisma.$transaction(async (tx) => {
        const financialAccount = await tx.financialAccount.create({
          data: {
            companyId: existing.companyId,
            kind: 'receivable',
            status: FinancialAccountStatus.open,
            contactId: existing.clientId!,
            categoryId: existing.categoryId ?? undefined,
            departmentId: existing.departmentId ?? undefined,
            bankAccountId: existing.bankAccountId ?? undefined,
            budgetId: existing.id,
            totalAmount: existing.totalAmount,
            description: `Budget ${existing.budgetNumber}`,
            issueDate: issueDateOnly,
            createdByUserId: uid,
            updatedByUserId: uid,
          },
        });

        for (let i = 0; i < installmentCount; i++) {
          const amount = installmentsAmounts[i].amountCents / 100;
          const dueDate = new Date(issueDateOnly);
          dueDate.setUTCDate(dueDate.getUTCDate() + 30 * i);
          await tx.installment.create({
            data: {
              companyId: existing.companyId,
              financialAccountId: financialAccount.id,
              installmentNumber: i + 1,
              dueDate: dueDate,
              amount,
              paidTotal: 0,
              status: InstallmentStatus.open,
              createdByUserId: uid,
              updatedByUserId: uid,
            },
          });
        }

        await tx.budget.update({
          where: { id },
          data: { status: BudgetStatus.approved, updatedByUserId: uid },
        });
        return tx.budget.findUniqueOrThrow({
          where: { id },
          include: { items: true },
        });
      });

      return result;
    }

    const updateData = buildBudgetUpdateData(dto, userId);
    const itemRows = buildItemRows(dto.items, companyId, id, userId);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.budget.update({ where: { id }, data: updateData });
      await tx.budgetItem.deleteMany({ where: { budgetId: id } });
      if (itemRows.length > 0) {
        await tx.budgetItem.createMany({ data: itemRows });
      }
      return tx.budget.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
    });

    return result;
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(
        'Orçamento não encontrado ou não pertence à empresa',
      );
    }
    await this.prisma.budget.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { deleted: true, id };
  }
}
