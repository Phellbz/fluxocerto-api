import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  FinancialAccountStatus,
  InstallmentStatus,
  MovementDirection,
  MovementStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialAccountPaymentDto } from './dto/create-payment.dto';

const USER_PLACEHOLDER = 'system';

/** Serializa payment para resposta GET/POST (Decimal → number, Date → ISO). */
function toPaymentResponse(
  row: {
    id: string;
    financialAccountId: string;
    installmentId: string | null;
    bankAccountId: string | null;
    paymentDate: Date;
    paidAmount: unknown;
    interest: unknown;
    discount: unknown;
    notes: string | null;
    createdAt: Date;
  },
) {
  const date = row.paymentDate instanceof Date ? row.paymentDate : new Date(row.paymentDate);
  const created = row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt);
  return {
    id: row.id,
    financialAccountId: row.financialAccountId,
    installmentId: row.installmentId ?? null,
    bankAccountId: row.bankAccountId,
    paymentDate: Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10),
    paidAmount: Number(row.paidAmount) || 0,
    interest: Number(row.interest) || 0,
    discount: Number(row.discount) || 0,
    notes: row.notes ?? null,
    createdAt: Number.isNaN(created.getTime()) ? '' : created.toISOString(),
  };
}

function toDateOnly(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException('paymentDate inválido (use YYYY-MM-DD)');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

@Injectable()
export class FinancialAccountPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista payments da financial account; financialAccountId obrigatório. */
  async listByFinancialAccount(companyId: string, financialAccountId: string) {
    try {
      const account = await this.prisma.financialAccount.findFirst({
        where: { id: financialAccountId, companyId },
      });
      if (!account) {
        throw new NotFoundException('Conta financeira não encontrada');
      }
      const rows = await this.prisma.financialAccountPayment.findMany({
        where: { companyId, financialAccountId },
        orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
      });
      return rows.map(toPaymentResponse);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.error('GET /financial-account-payments failed', {
        companyId,
        financialAccountId,
        message: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  }

  /** Cria payment, aplica FIFO nas parcelas e recalcula status da conta (alias para createPayment). */
  async createPaymentAndRecalc(
    companyId: string,
    userId: string | null,
    dto: CreateFinancialAccountPaymentDto,
  ) {
    return this.createPayment(companyId, userId, dto);
  }

  async createPayment(
    companyId: string,
    userId: string | null,
    dto: CreateFinancialAccountPaymentDto,
  ) {
    const uid = userId ?? USER_PLACEHOLDER;
    const paymentDate = toDateOnly(dto.paymentDate);
    const paidAmount = Number(dto.paidAmount);
    const interest = Number(dto.interest ?? 0);
    const discount = Number(dto.discount ?? 0);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
      throw new BadRequestException('paidAmount deve ser maior que zero');
    }
    if (!Number.isFinite(interest) || interest < 0) {
      throw new BadRequestException('interest deve ser maior ou igual a zero');
    }
    if (!Number.isFinite(discount) || discount < 0) {
      throw new BadRequestException('discount deve ser maior ou igual a zero');
    }
    if (discount > paidAmount) {
      throw new BadRequestException('discount não pode ser maior que paidAmount');
    }

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.financialAccount.findFirst({
        where: { id: dto.financialAccountId, companyId },
        include: { installments: { orderBy: [{ dueDate: 'asc' }, { installmentNumber: 'asc' }] } },
      });
      if (!account) {
        throw new NotFoundException(
          'Conta financeira não encontrada ou não pertence à empresa',
        );
      }
      if (account.status === FinancialAccountStatus.canceled) {
        throw new BadRequestException('Conta financeira está cancelada');
      }
      if (account.status === FinancialAccountStatus.paid) {
        throw new BadRequestException('Conta financeira já está quitada');
      }

      const payment = await tx.financialAccountPayment.create({
        data: {
          companyId,
          financialAccountId: dto.financialAccountId,
          installmentId: dto.installmentId ?? null,
          bankAccountId: (dto.bankAccountId ?? '').trim() || null,
          paymentDate,
          paidAmount: String(paidAmount),
          interest: String(interest),
          discount: String(discount),
          notes: (dto.notes ?? '').trim() || null,
          createdByUserId: uid,
          updatedByUserId: uid,
        },
      });

      if (
        dto.installmentId != null &&
        !account.installments.some((i) => i.id === dto.installmentId)
      ) {
        throw new BadRequestException(
          'installmentId não pertence a esta conta financeira',
        );
      }

      // FIFO: open/partial por due_date ASC; se installmentId veio, essa parcela primeiro
      const openOrPartial = account.installments.filter(
        (i) => Number(i.paidTotal) < Number(i.amount),
      );
      let ordered: typeof account.installments =
        openOrPartial.length === 0
          ? []
          : [...openOrPartial].sort(
              (a, b) =>
                new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
            );
      if (dto.installmentId != null && ordered.length > 0) {
        const idx = ordered.findIndex((i) => i.id === dto.installmentId);
        if (idx > 0) {
          const [target] = ordered.splice(idx, 1);
          ordered = [target, ...ordered];
        }
      }

      let remaining = paidAmount;
      for (const inst of ordered) {
        if (remaining <= 0) break;
        const amount = Number(inst.amount);
        const paidTotal = Number(inst.paidTotal);
        const available = Math.max(0, amount - paidTotal);
        const toApply = Math.min(remaining, available);
        if (toApply <= 0) continue;
        const newPaidTotal = paidTotal + toApply;
        remaining -= toApply;
        const status: InstallmentStatus =
          newPaidTotal >= amount
            ? InstallmentStatus.paid
            : newPaidTotal > 0
              ? InstallmentStatus.partial
              : InstallmentStatus.open;
        await tx.installment.update({
          where: { id: inst.id },
          data: {
            paidTotal: String(newPaidTotal),
            status,
            updatedByUserId: uid,
          },
        });
      }

      const installmentsAfter = await tx.installment.findMany({
        where: { financialAccountId: account.id },
        orderBy: [{ dueDate: 'asc' }, { installmentNumber: 'asc' }],
      });
      const principalPaidTotal = installmentsAfter.reduce(
        (sum, i) => sum + Number(i.paidTotal),
        0,
      );
      const totalAmount = Number(account.totalAmount);
      const newAccountStatus: FinancialAccountStatus =
        principalPaidTotal >= totalAmount
          ? FinancialAccountStatus.paid
          : principalPaidTotal > 0
            ? FinancialAccountStatus.partial
            : FinancialAccountStatus.open;
      const isSettled = principalPaidTotal >= totalAmount;

      await tx.financialAccount.update({
        where: { id: account.id },
        data: {
          status: newAccountStatus,
          isSettled,
          updatedByUserId: uid,
        },
      });

      const movementAmount = paidAmount + interest - discount;
      const amountCents = Math.round(movementAmount * 100);
      const direction: MovementDirection =
        account.kind === 'receivable'
          ? MovementDirection.in
          : MovementDirection.out;
      const movementDesc =
        (account.kind === 'receivable' ? 'Recebimento: ' : 'Pagamento: ') +
        (account.description || 'Conta financeira');

      const bankAccountIdPayment = (dto.bankAccountId ?? '').trim() || null;
      if (bankAccountIdPayment != null) {
        await tx.movement.create({
          data: {
            companyId,
            description: movementDesc,
            amountCents,
            direction,
            occurredAt: paymentDate,
            bankAccountId: bankAccountIdPayment,
            paymentId: payment.id,
            source: 'system',
            status: MovementStatus.REALIZED,
            isReconciled: true,
            categoryId: account.categoryId,
            contactId: account.contactId,
            departmentId: account.departmentId,
          },
        });
      }

      const created = await tx.financialAccountPayment.findUniqueOrThrow({
        where: { id: payment.id },
        include: {
          financialAccount: { select: { status: true, isSettled: true } },
          installment: { select: { id: true, paidTotal: true, status: true } },
        },
      });
      return {
        ...toPaymentResponse(created),
        financialAccount: {
          status: created.financialAccount.status,
          isSettled: created.financialAccount.isSettled,
        },
        installment: created.installment
          ? {
              id: created.installment.id,
              paidTotal: Number(created.installment.paidTotal),
              status: created.installment.status,
            }
          : null,
      };
    });
  }
}
