import { Test, TestingModule } from '@nestjs/testing';
import { FinancialAccountsService } from './financial-accounts.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('FinancialAccountsService', () => {
  let service: FinancialAccountsService;
  const prisma = {
    financialAccount: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    installment: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn((cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        financialAccount: {
          create: jest.fn().mockResolvedValue({
            id: 'fa-1',
            companyId: 'company-1',
            kind: 'receivable',
            status: 'open',
          }),
          findUniqueOrThrow: jest.fn().mockResolvedValue({
            id: 'fa-1',
            installments: [],
          }),
        },
        installment: { create: jest.fn().mockResolvedValue({}) },
      };
      return cb(tx);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinancialAccountsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<FinancialAccountsService>(FinancialAccountsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('retorna lista filtrada por company_id', async () => {
      await service.list('company-1');
      expect(prisma.financialAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'company-1' },
        }),
      );
    });

    it('aplica filtro kind quando informado', async () => {
      await service.list('company-1', 'receivable');
      expect(prisma.financialAccount.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'company-1', kind: 'receivable' },
        }),
      );
    });
  });

  describe('create', () => {
    it('cria conta e retorna com include installments', async () => {
      const result = await service.create('company-1', 'user-1', {
        kind: 'receivable',
        contactId: 'c-1',
        description: 'Test',
        issueDate: '2026-02-04',
        totalAmount: 1000,
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('fa-1');
    });
  });
});
