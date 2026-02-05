import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FinancialAccount, FinancialAccountKind } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialAccountDto } from './dto/create-financial-account.dto';

const USER_PLACEHOLDER = 'system';

/** Serializa FinancialAccount para JSON (Decimal → number, Date → ISO). */
function toFinancialAccountResponse(row: FinancialAccount) {
  return {
    id: row.id,
    kind: row.kind,
    contactId: row.contactId,
    categoryId: row.categoryId,
    departmentId: row.departmentId,
    bankAccountId: row.bankAccountId,
    budgetId: row.budgetId,
    totalAmount: Number(row.totalAmount),
    description: row.description,
    invoiceNumber: row.invoiceNumber,
    issueDate: row.issueDate.toISOString().slice(0, 10),
    status: row.status,
    observations: row.observations,
    isSettled: row.isSettled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

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

  /** Um único financial account por id, filtrado por companyId. Sem installments. */
  async getById(companyId: string, id: string) {
    const row = await this.prisma.financialAccount.findFirst({
      where: { id, companyId },
    });
    if (!row) {
      throw new NotFoundException('Financial account not found');
    }
    return toFinancialAccountResponse(row);
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
