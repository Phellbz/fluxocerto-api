import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CashTodayResponse {
  openingBalanceTotal: number;
  movementsInTotal: number;
  movementsOutTotal: number;
  cashToday: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashToday(companyId: string): Promise<CashTodayResponse> {
    const [openSum, inSum, outSum] = await Promise.all([
      this.prisma.bankAccount.aggregate({
        where: { companyId, isActive: true },
        _sum: { openingBalance: true },
      }),
      this.prisma.movement.aggregate({
        where: { companyId, direction: 'in' },
        _sum: { amountCents: true },
      }),
      this.prisma.movement.aggregate({
        where: { companyId, direction: 'out' },
        _sum: { amountCents: true },
      }),
    ]);

    const openingBalanceTotal = Number(openSum._sum?.openingBalance ?? 0);
    const movementsInTotal = (inSum._sum?.amountCents ?? 0) / 100;
    const movementsOutTotal = (outSum._sum?.amountCents ?? 0) / 100;
    const cashToday = openingBalanceTotal + movementsInTotal - movementsOutTotal;

    return {
      openingBalanceTotal,
      movementsInTotal,
      movementsOutTotal,
      cashToday,
    };
  }
}
