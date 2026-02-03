import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetItemInputDto } from './dto/budget-item-input.dto';

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

function toDateTime(value: string | null | undefined): Date | null {
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

function buildBudgetData(
  dto: CreateBudgetDto | UpdateBudgetDto,
  companyId: string,
  createdBy?: string | null,
): Prisma.BudgetUncheckedCreateInput {
  const data: Prisma.BudgetUncheckedCreateInput = {
    companyId,
    budgetNumber: str(dto.budgetNumber) ?? undefined,
    status: str(dto.status) ?? undefined,
    stage: str(dto.stage) ?? undefined,
    clientId: str(dto.clientId) ?? undefined,
    clientName: str(dto.clientName) ?? undefined,
    clientFullName: str(dto.clientFullName) ?? undefined,
    clientDocument: str(dto.clientDocument) ?? undefined,
    clientTags: str(dto.clientTags) ?? undefined,
    contactName: str(dto.contactName) ?? undefined,
    totalServices: toDecimal(dto.totalServices) ?? undefined,
    totalMaterials: toDecimal(dto.totalMaterials) ?? undefined,
    totalAmount: toDecimal(dto.totalAmount) ?? undefined,
    installmentCount:
      dto.installmentCount != null ? Number(dto.installmentCount) : undefined,
    paymentMethodLabel: str(dto.paymentMethodLabel) ?? undefined,
    bankAccountId: str(dto.bankAccountId) ?? undefined,
    bankAccountName: str(dto.bankAccountName) ?? undefined,
    categoryId: str(dto.categoryId) ?? undefined,
    categoryName: str(dto.categoryName) ?? undefined,
    departmentId: str(dto.departmentId) ?? undefined,
    advancePaymentStatus: str(dto.advancePaymentStatus) ?? undefined,
    expectedBillingDate: toDateOnly(dto.expectedBillingDate) ?? undefined,
    billedAt: toDateTime(dto.billedAt) ?? undefined,
    billedBy: str(dto.billedBy) ?? undefined,
    rpsDate: toDateOnly(dto.rpsDate) ?? undefined,
    clientOrderNumber: str(dto.clientOrderNumber) ?? undefined,
    sellerName: str(dto.sellerName) ?? undefined,
    projectName: str(dto.projectName) ?? undefined,
    contractNumber: str(dto.contractNumber) ?? undefined,
    constructionCode: str(dto.constructionCode) ?? undefined,
    artCode: str(dto.artCode) ?? undefined,
    productRemittance: str(dto.productRemittance) ?? undefined,
    observations: str(dto.observations) ?? undefined,
  };
  if (createdBy != null) {
    data.createdBy = createdBy;
  }
  return data;
}

function buildBudgetUpdateData(dto: UpdateBudgetDto) {
  const data: Prisma.BudgetUpdateInput = {};
  if (dto.budgetNumber !== undefined) data.budgetNumber = str(dto.budgetNumber);
  if (dto.status !== undefined) data.status = str(dto.status);
  if (dto.stage !== undefined) data.stage = str(dto.stage);
  if (dto.clientId !== undefined) data.clientId = str(dto.clientId);
  if (dto.clientName !== undefined) data.clientName = str(dto.clientName);
  if (dto.clientFullName !== undefined)
    data.clientFullName = str(dto.clientFullName);
  if (dto.clientDocument !== undefined)
    data.clientDocument = str(dto.clientDocument);
  if (dto.clientTags !== undefined) data.clientTags = str(dto.clientTags);
  if (dto.contactName !== undefined) data.contactName = str(dto.contactName);
  if (dto.totalServices !== undefined)
    data.totalServices = toDecimal(dto.totalServices);
  if (dto.totalMaterials !== undefined)
    data.totalMaterials = toDecimal(dto.totalMaterials);
  if (dto.totalAmount !== undefined) data.totalAmount = toDecimal(dto.totalAmount);
  if (dto.installmentCount !== undefined)
    data.installmentCount = Number(dto.installmentCount);
  if (dto.paymentMethodLabel !== undefined)
    data.paymentMethodLabel = str(dto.paymentMethodLabel);
  if (dto.bankAccountId !== undefined)
    data.bankAccountId = str(dto.bankAccountId);
  if (dto.bankAccountName !== undefined)
    data.bankAccountName = str(dto.bankAccountName);
  if (dto.categoryId !== undefined) data.categoryId = str(dto.categoryId);
  if (dto.categoryName !== undefined) data.categoryName = str(dto.categoryName);
  if (dto.departmentId !== undefined) data.departmentId = str(dto.departmentId);
  if (dto.advancePaymentStatus !== undefined)
    data.advancePaymentStatus = str(dto.advancePaymentStatus);
  if (dto.expectedBillingDate !== undefined)
    data.expectedBillingDate = toDateOnly(dto.expectedBillingDate);
  if (dto.billedAt !== undefined) data.billedAt = toDateTime(dto.billedAt);
  if (dto.billedBy !== undefined) data.billedBy = str(dto.billedBy);
  if (dto.rpsDate !== undefined) data.rpsDate = toDateOnly(dto.rpsDate);
  if (dto.clientOrderNumber !== undefined)
    data.clientOrderNumber = str(dto.clientOrderNumber);
  if (dto.sellerName !== undefined) data.sellerName = str(dto.sellerName);
  if (dto.projectName !== undefined) data.projectName = str(dto.projectName);
  if (dto.contractNumber !== undefined)
    data.contractNumber = str(dto.contractNumber);
  if (dto.constructionCode !== undefined)
    data.constructionCode = str(dto.constructionCode);
  if (dto.artCode !== undefined) data.artCode = str(dto.artCode);
  if (dto.productRemittance !== undefined)
    data.productRemittance = str(dto.productRemittance);
  if (dto.observations !== undefined) data.observations = str(dto.observations);
  return data;
}

function buildItemRows(
  items: BudgetItemInputDto[] | undefined,
  budgetId: string,
): Prisma.BudgetItemCreateManyInput[] {
  if (!items?.length) return [];
  return items.map((it) => ({
    budgetId,
    itemType: str(it.itemType) ?? undefined,
    productId: str(it.productId) ?? undefined,
    description: str(it.description) ?? undefined,
    detailedDescription: str(it.detailedDescription) ?? undefined,
    quantity: toDecimal(it.quantity) ?? undefined,
    unitPrice: toDecimal(it.unitPrice) ?? undefined,
    discountPercent: toDecimal(it.discountPercent) ?? undefined,
    lineTotal: toDecimal(it.lineTotal) ?? undefined,
  }));
}

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.budget.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(companyId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, companyId },
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
    const budgetData = buildBudgetData(dto, companyId, userId);

    const result = await this.prisma.$transaction(async (tx) => {
      const budget = await tx.budget.create({ data: budgetData });
      const itemRows = buildItemRows(dto.items, budget.id);
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

  async update(companyId: string, id: string, dto: UpdateBudgetDto) {
    const existing = await this.prisma.budget.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Orçamento não encontrado ou não pertence à empresa',
      );
    }

    const updateData = buildBudgetUpdateData(dto);
    const itemRows = buildItemRows(dto.items, id);

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
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Orçamento não encontrado ou não pertence à empresa',
      );
    }
    await this.prisma.budget.delete({ where: { id } });
    return { deleted: true, id };
  }
}
