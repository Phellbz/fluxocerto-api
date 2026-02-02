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

  /** Endpoint POST /categories/bootstrap: insere DEFAULT_CATEGORIES para a empresa (idempotente). */
  async bootstrapDefaults(companyId: string): Promise<{
    inserted: number;
    skipped: number;
  }> {
    console.log('[categories] bootstrapDefaults start', { companyId });

    const existing = await this.prisma.category.findMany({
      where: { companyId },
      select: { name: true },
    });

    const existingSet = new Set(
      existing.map((c) => (c.name ?? '').trim()),
    );
    const missing = DEFAULT_CATEGORIES.filter(
      (c) => !existingSet.has(c.name.trim()),
    );

    if (missing.length === 0) {
      console.log('[categories] bootstrapDefaults nothing to insert', {
        companyId,
      });
      return { inserted: 0, skipped: existing.length };
    }

    const data = missing.map((c) => ({
      companyId,
      name: c.name.trim(),
      groupName: (c.groupName ?? '').trim() || '',
      flowType: toFlowType(c.flowType),
      affectsCash: !!c.affectsCash,
      isActive: !!c.isActive,
      groupId: null as string | null,
    }));

    try {
      const result = await this.prisma.category.createMany({
        data,
        skipDuplicates: true,
      });

      console.log('[categories] bootstrapDefaults inserted (createMany)', {
        companyId,
        inserted: result.count,
        missing: missing.length,
      });

      return { inserted: result.count, skipped: existing.length };
    } catch (err) {
      console.error('[categories] createMany failed, fallback to create', {
        companyId,
        err,
      });

      let inserted = 0;
      for (const item of data) {
        try {
          await this.prisma.category.create({ data: item });
          inserted += 1;
        } catch {
          // skipDuplicates: categoria já existe (race ou unique)
        }
      }

      console.log('[categories] bootstrapDefaults inserted (fallback)', {
        companyId,
        inserted,
      });
      return { inserted, skipped: existing.length };
    }
  }
}
