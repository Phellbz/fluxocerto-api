import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CashTodayResponse {
  openingBalanceTotal: number;
  movementsInTotal: number;
  movementsOutTotal: number;
  cashToday: number;
}

export interface CashFlowDayItem {
  date: string;
  in: number;
  out: number;
  net: number;
  balance: number;
}

export interface CashFlowResponse {
  days: number;
  from: string;
  to: string;
  series: CashFlowDayItem[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashFlow(companyId: string, days: number): Promise<CashFlowResponse> {
    const fromDate = new Date();
    fromDate.setUTCHours(0, 0, 0, 0);
    fromDate.setUTCDate(fromDate.getUTCDate() - (days - 1));
    const toDate = new Date();
    toDate.setUTCHours(0, 0, 0, 0);

    const fromStr = fromDate.toISOString().slice(0, 10);
    const toStr = toDate.toISOString().slice(0, 10);

    const openSum = await this.prisma.bankAccount.aggregate({
      where: { companyId, isActive: true },
      _sum: { openingBalance: true },
    });
    const openingBalanceTotal = Number(openSum._sum?.openingBalance ?? 0);

    const toDateEnd = new Date(toDate);
    toDateEnd.setUTCDate(toDateEnd.getUTCDate() + 1);

    type Row = { date: Date; in_cents: bigint; out_cents: bigint };
    const rows = await this.prisma.$queryRaw<Row[]>`
      SELECT
        (occurred_at AT TIME ZONE 'UTC')::date AS date,
        COALESCE(SUM(CASE WHEN direction = 'in' THEN amount_cents ELSE 0 END), 0)::bigint AS in_cents,
        COALESCE(SUM(CASE WHEN direction = 'out' THEN amount_cents ELSE 0 END), 0)::bigint AS out_cents
      FROM movements
      WHERE company_id = ${companyId}
        AND occurred_at >= ${fromDate}
        AND occurred_at < ${toDateEnd}
      GROUP BY (occurred_at AT TIME ZONE 'UTC')::date
      ORDER BY date
    `;

    const byDate = new Map<string, { in: number; out: number }>();
    for (const r of rows) {
      const d = r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10);
      byDate.set(d, {
        in: Number(r.in_cents) / 100,
        out: Number(r.out_cents) / 100,
      });
    }

    const series: CashFlowDayItem[] = [];
    let runningBalance = openingBalanceTotal;
    const current = new Date(fromDate);

    while (current <= toDate) {
      const dateStr = current.toISOString().slice(0, 10);
      const item = byDate.get(dateStr) ?? { in: 0, out: 0 };
      const net = item.in - item.out;
      runningBalance += net;
      series.push({
        date: dateStr,
        in: item.in,
        out: item.out,
        net,
        balance: runningBalance,
      });
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return {
      days,
      from: fromStr,
      to: toStr,
      series,
    };
  }

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
