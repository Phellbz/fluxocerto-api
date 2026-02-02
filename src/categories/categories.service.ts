import { Injectable } from '@nestjs/common';
import { CategoryFlowType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_CATEGORIES } from './default-categories';

function toFlowType(
  flow: 'expense' | 'income' | 'transfer',
): CategoryFlowType {
  switch (flow) {
    case 'expense':
      return CategoryFlowType.EXPENSE;
    case 'income':
      return CategoryFlowType.INCOME;
    case 'transfer':
      return CategoryFlowType.TRANSFER;
    default:
      return CategoryFlowType.EXPENSE;
  }
}

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults(companyId: string): Promise<void> {
    const existing = await this.prisma.category.findMany({
      where: { companyId },
      select: { name: true },
    });

    const existingSet = new Set(existing.map((c) => c.name.trim()));

    const missing = DEFAULT_CATEGORIES.filter(
      (c) => !existingSet.has(c.name.trim()),
    ).map((c) => ({
      companyId,
      name: c.name.trim(),
      groupName: (c.groupName ?? '').trim() || '',
      flowType: toFlowType(c.flowType),
      affectsCash: c.affectsCash,
      isActive: c.isActive,
      groupId: null as string | null,
    }));

    if (missing.length > 0) {
      await this.prisma.category.createMany({ data: missing });
    }
  }

  async list(companyId: string) {
    await this.ensureDefaults(companyId);
    return this.prisma.category.findMany({
      where: { companyId, isActive: true },
      orderBy: [{ groupName: 'asc' }, { name: 'asc' }],
    });
  }
}
