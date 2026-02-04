import { BadRequestException, Injectable } from '@nestjs/common';
import { FinancialAccountKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialAccountDto } from './dto/create-financial-account.dto';

const USER_PLACEHOLDER = 'system';

function toDateOnly(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('issueDate inválido (use YYYY-MM-DD)');
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

@Injectable()
export class FinancialAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    companyId: string,
    kind?: 'payable' | 'receivable' | null,
  ) {
    const where: { companyId: string; kind?: FinancialAccountKind } = {
      companyId,
    };
    if (kind === 'payable' || kind === 'receivable') {
      where.kind = kind as FinancialAccountKind;
    }
    return this.prisma.financialAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { installments: { orderBy: { installmentNumber: 'asc' } } },
    });
  }

  async create(
    companyId: string,
    userId: string | null,
    dto: CreateFinancialAccountDto,
  ) {
    const uid = userId ?? USER_PLACEHOLDER;
    const issueDate = toDateOnly(dto.issueDate);
    const totalAmount = Number(dto.totalAmount);
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new BadRequestException('totalAmount deve ser maior que zero');
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.financialAccount.create({
        data: {
          companyId,
          kind: dto.kind as FinancialAccountKind,
          status: 'open',
          isSettled: false,
          contactId: dto.contactId,
          categoryId: dto.categoryId ?? null,
          departmentId: dto.departmentId ?? null,
          bankAccountId: dto.bankAccountId ?? null,
          totalAmount: String(totalAmount),
          description: (dto.description ?? '').trim() || 'Sem descrição',
          invoiceNumber: (dto.invoiceNumber ?? '').trim() || null,
          issueDate,
          observations: (dto.observations ?? '').trim() || null,
          createdByUserId: uid,
          updatedByUserId: uid,
        },
      });

      if (dto.installments?.length) {
        for (const item of dto.installments) {
          const dueDate = toDateOnly(item.date);
          const amount = Number(item.amount);
          if (!Number.isFinite(amount) || amount <= 0) continue;
          await tx.installment.create({
            data: {
              companyId,
              financialAccountId: account.id,
              installmentNumber: item.installmentNumber,
              dueDate,
              amount: String(amount),
              paidTotal: '0',
              status: 'open',
              createdByUserId: uid,
              updatedByUserId: uid,
            },
          });
        }
      }

      return tx.financialAccount.findUniqueOrThrow({
        where: { id: account.id },
        include: {
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
      });
    });
  }
}
