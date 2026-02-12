import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InstallmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FinancialAccountPaymentsService } from '../financial-account-payments/financial-account-payments.service';
import { SettleInstallmentDto } from './dto/settle-installment.dto';

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: FinancialAccountPaymentsService,
  ) {}

  /**
   * Agrega total de parcelas por financialAccountId.
   * Retorna [{ financialAccountId, totalInstallments }] apenas para os ids informados.
   */
  async summaryByFinancialAccounts(
    companyId: string,
    financialAccountIds: string[],
  ) {
    const result = await this.prisma.installment.groupBy({
      by: ['financialAccountId'],
      where: {
        companyId,
        financialAccountId: { in: financialAccountIds },
      },
      _count: { _all: true },
    });
    return result.map((r) => ({
      financialAccountId: r.financialAccountId,
      totalInstallments: r._count._all,
    }));
  }

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

  /**
   * Dar baixa na parcela: cria financial_account_payment e recalcula installment + financial_account.
   * Retorna o payment criado (não altera installment diretamente sem criar payment).
   */
  async settle(
    companyId: string,
    installmentId: string,
    dto: SettleInstallmentDto,
    userId: string | null,
  ) {
    const paidAmount = Number(dto.paidAmount ?? 0);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      throw new BadRequestException(
        'paidAmount é obrigatório e deve ser maior que zero para dar baixa',
      );
    }

    const installment = await this.prisma.installment.findFirst({
      where: { id: installmentId, companyId },
      include: { financialAccount: true },
    });
    if (!installment) {
      throw new NotFoundException('Parcela não encontrada');
    }
    if (installment.companyId !== companyId) {
      throw new ForbiddenException(
        'Parcela não pertence à empresa informada',
      );
    }

    const paymentDate =
      dto.paymentDate?.trim() &&
      !Number.isNaN(new Date(dto.paymentDate).getTime())
        ? dto.paymentDate.trim()
        : new Date().toISOString().slice(0, 10);

    return this.paymentsService.createPayment(companyId, userId, {
      financialAccountId: installment.financialAccountId,
      installmentId: installment.id,
      bankAccountId: (dto.bankAccountId ?? '').trim() || undefined,
      paymentDate,
      paidAmount,
      interest: 0,
      discount: 0,
      notes: dto.notes ?? undefined,
    });
  }
}
