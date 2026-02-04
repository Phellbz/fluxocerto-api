import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FinancialAccountPaymentsService } from './financial-account-payments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFinancialAccountPaymentDto } from './dto/create-payment.dto';

const companyId = 'company-1';
const userId = 'user-1';

function buildInstallments(
  amounts: number[],
  paidTotals: number[] = amounts.map(() => 0),
) {
  return amounts.map((amount, i) => ({
    id: `inst-${i + 1}`,
    companyId,
    financialAccountId: 'fa-1',
    installmentNumber: i + 1,
    dueDate: new Date(2025, 0, 1 + i * 30),
    amount: amount,
    paidTotal: paidTotals[i] ?? 0,
    status: (paidTotals[i] ?? 0) >= amount ? 'paid' : (paidTotals[i] ?? 0) > 0 ? 'partial' : 'open',
    createdByUserId: userId,
    updatedByUserId: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

describe('FinancialAccountPaymentsService', () => {
  let service: FinancialAccountPaymentsService;
  let tx: {
    financialAccount: { findFirst: jest.Mock; update: jest.Mock };
    financialAccountPayment: { create: jest.Mock; findUniqueOrThrow: jest.Mock };
    installment: { findMany: jest.Mock; update: jest.Mock };
    movement: { create: jest.Mock };
  };

  beforeEach(async () => {
    tx = {
      financialAccount: {
        findFirst: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      financialAccountPayment: {
        create: jest.fn().mockResolvedValue({
          id: 'pay-1',
          companyId,
          financialAccountId: 'fa-1',
          bankAccountId: 'ba-1',
          paymentDate: new Date('2025-02-01'),
          paidAmount: 100,
          interest: 0,
          discount: 0,
          financialAccount: { status: 'partial', isSettled: false },
          installment: null,
        }),
        findUniqueOrThrow: jest.fn().mockImplementation((args: { where: { id: string } }) =>
          Promise.resolve({
            id: args.where.id,
            financialAccount: { status: 'partial', isSettled: false },
            installment: null,
          }),
        ),
      },
      installment: {
        findMany: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      movement: { create: jest.fn().mockResolvedValue({}) },
    };

    const prisma = {
      $transaction: jest.fn((cb: (t: typeof tx) => Promise<unknown>) => cb(tx)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialAccountPaymentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<FinancialAccountPaymentsService>(
      FinancialAccountPaymentsService,
    );
  });

  function dto(partial: Partial<CreateFinancialAccountPaymentDto> = {}) {
    return {
      financialAccountId: 'fa-1',
      bankAccountId: 'ba-1',
      paymentDate: '2025-02-01',
      paidAmount: 100,
      ...partial,
    };
  }

  describe('Caso 1 — FIFO parcial', () => {
    it('paidAmount 150 em 3 parcelas de 100: atualiza parcela1 100 paid, parcela2 50 partial, movement 150 in', async () => {
      const installments = buildInstallments([100, 100, 100]);
      tx.financialAccount.findFirst.mockResolvedValue({
        id: 'fa-1',
        companyId,
        kind: 'receivable',
        status: 'open',
        contactId: 'c-1',
        categoryId: 'cat-1',
        departmentId: 'dep-1',
        bankAccountId: 'ba-1',
        totalAmount: 300,
        description: 'Test',
        installments,
      });
      tx.installment.findMany.mockResolvedValue([
        { ...installments[0], paidTotal: 100, status: 'paid' },
        { ...installments[1], paidTotal: 50, status: 'partial' },
        { ...installments[2], paidTotal: 0, status: 'open' },
      ]);

      await service.createPayment(companyId, userId, dto({ paidAmount: 150 }));

      expect(tx.installment.update).toHaveBeenCalledTimes(2);
      expect(tx.installment.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'inst-1' },
        data: expect.objectContaining({
          paidTotal: '100',
          status: 'paid',
        }),
      });
      expect(tx.installment.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'inst-2' },
        data: expect.objectContaining({
          paidTotal: '50',
          status: 'partial',
        }),
      });
      expect(tx.movement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId,
          bankAccountId: 'ba-1',
          paymentId: 'pay-1',
          amountCents: 15000,
          direction: 'in',
          source: 'system',
        }),
      });
    });
  });

  describe('Caso 4 — interest/discount', () => {
    it('paid_amount=100, interest=10, discount=5 => movement.amountCents = 10500', async () => {
      const installments = buildInstallments([100]);
      tx.financialAccount.findFirst.mockResolvedValue({
        id: 'fa-1',
        companyId,
        kind: 'receivable',
        status: 'open',
        contactId: 'c-1',
        categoryId: null,
        departmentId: null,
        bankAccountId: 'ba-1',
        totalAmount: 100,
        description: 'Test',
        installments,
      });
      tx.installment.findMany.mockResolvedValue([
        { ...installments[0], paidTotal: 100, status: 'paid' },
      ]);

      await service.createPayment(companyId, userId, dto({
        paidAmount: 100,
        interest: 10,
        discount: 5,
      }));

      expect(tx.movement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          amountCents: 10500,
          source: 'system',
        }),
      });
    });
  });

  describe('rejeita conta cancelada ou quitada', () => {
    it('lança BadRequest se status = canceled', async () => {
      tx.financialAccount.findFirst.mockResolvedValue({
        id: 'fa-1',
        companyId,
        kind: 'receivable',
        status: 'canceled',
        installments: [],
      });

      await expect(
        service.createPayment(companyId, userId, dto()),
      ).rejects.toThrow(BadRequestException);
    });

    it('lança BadRequest se status = paid', async () => {
      tx.financialAccount.findFirst.mockResolvedValue({
        id: 'fa-1',
        companyId,
        kind: 'receivable',
        status: 'paid',
        installments: [],
      });

      await expect(
        service.createPayment(companyId, userId, dto()),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('payable => direction out', () => {
    it('movement.direction = out quando kind = payable', async () => {
      const installments = buildInstallments([100]);
      tx.financialAccount.findFirst.mockResolvedValue({
        id: 'fa-1',
        companyId,
        kind: 'payable',
        status: 'open',
        contactId: 'c-1',
        categoryId: null,
        departmentId: null,
        bankAccountId: 'ba-1',
        totalAmount: 100,
        description: 'Test',
        installments,
      });
      tx.installment.findMany.mockResolvedValue([
        { ...installments[0], paidTotal: 100, status: 'paid' },
      ]);

      await service.createPayment(companyId, userId, dto({ paidAmount: 100 }));

      expect(tx.movement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          direction: 'out',
        }),
      });
    });
  });
});
