import { Injectable } from '@nestjs/common';
import { InstallmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ListInstallmentsQuery {
  status?: 'open' | 'partial' | 'paid';
  from?: string;
  to?: string;
  kind?: 'payable' | 'receivable';
  financialAccountId?: string;
  limit?: string;
  offset?: string;
}

@Injectable()
export class InstallmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string, query: ListInstallmentsQuery) {
    const limit = Math.min(500, Math.max(1, parseInt(query.limit ?? '500', 10) || 500));
    const offset = Math.max(0, parseInt(query.offset ?? '0', 10) || 0);

    const where: {
      companyId: string;
      status?: InstallmentStatus;
      financialAccountId?: string;
      dueDate?: { gte?: Date; lte?: Date };
      financialAccount?: { kind?: 'payable' | 'receivable' };
    } = { companyId };

    if (query.status === 'open' || query.status === 'partial' || query.status === 'paid') {
      where.status = query.status as InstallmentStatus;
    }
    if (query.financialAccountId?.trim()) {
      where.financialAccountId = query.financialAccountId.trim();
    }
    if (query.from?.trim() || query.to?.trim()) {
      where.dueDate = {};
      if (query.from?.trim()) {
        const from = new Date(query.from.trim());
        if (!Number.isNaN(from.getTime())) {
          where.dueDate.gte = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
        }
      }
      if (query.to?.trim()) {
        const to = new Date(query.to.trim());
        if (!Number.isNaN(to.getTime())) {
          where.dueDate.lte = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
        }
      }
    }
    if (query.kind === 'payable' || query.kind === 'receivable') {
      where.financialAccount = { kind: query.kind };
    }

    return this.prisma.installment.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { installmentNumber: 'asc' }],
      take: limit,
      skip: offset,
      include: {
        financialAccount: {
          select: {
            id: true,
            kind: true,
            description: true,
            contactId: true,
            categoryId: true,
            departmentId: true,
          },
        },
      },
    });
  }
}
