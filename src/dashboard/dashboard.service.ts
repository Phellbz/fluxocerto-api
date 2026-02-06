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
  balanceWithOverdue: number;
}

export interface CashFlowResponse {
  days: number;
  from: string;
  to: string;
  cashToday: number;
  overdueInTotal: number;
  overdueOutTotal: number;
  cashTodayWithOverdue: number;
  series: CashFlowDayItem[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getCashFlow(companyId: string, days: number): Promise<CashFlowResponse> {
    type TodayRow = { today: string };
    const [todayResult] = await this.prisma.$queryRaw<TodayRow[]>`
      SELECT to_char(CURRENT_DATE AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS today
    `;
    const todayStr =
      todayResult?.today ?? new Date().toISOString().slice(0, 10);

    const cashTodayRes = await this.getCashToday(companyId);
    const cashToday = cashTodayRes.cashToday;

    type OverdueRow = { kind: string; total: string };
    const overdueRows = await this.prisma.$queryRaw<OverdueRow[]>`
      SELECT fa.kind, COALESCE(SUM((i.amount - i.paid_total)::numeric), 0)::text AS total
      FROM installments i
      INNER JOIN financial_accounts fa ON fa.id = i.financial_account_id AND fa.company_id = i.company_id
      WHERE i.company_id = ${companyId}
        AND i.due_date < CURRENT_DATE
        AND i.paid_total < i.amount
      GROUP BY fa.kind
    `;
    let overdueInTotal = 0;
    let overdueOutTotal = 0;
    for (const r of overdueRows) {
      const total = Number(r.total) || 0;
      if (r.kind === 'receivable') overdueInTotal += total;
      if (r.kind === 'payable') overdueOutTotal += total;
    }
    const cashTodayWithOverdue =
      cashToday + overdueInTotal - overdueOutTotal;

    type RangeRow = { date: string; kind: string; total: string };
    const rangeRows = await this.prisma.$queryRaw<RangeRow[]>`
      SELECT to_char(i.due_date, 'YYYY-MM-DD') AS date, fa.kind, COALESCE(SUM((i.amount - i.paid_total)::numeric), 0)::text AS total
      FROM installments i
      INNER JOIN financial_accounts fa ON fa.id = i.financial_account_id AND fa.company_id = i.company_id
      WHERE i.company_id = ${companyId}
        AND i.due_date >= CURRENT_DATE
        AND i.due_date < CURRENT_DATE + (${days} * INTERVAL '1 day')
        AND i.paid_total < i.amount
      GROUP BY i.due_date, fa.kind
      ORDER BY date
    `;
    const byDate = new Map<string, { in: number; out: number }>();
    for (const r of rangeRows) {
      const date = r.date.slice(0, 10);
      const cur = byDate.get(date) ?? { in: 0, out: 0 };
      const total = Number(r.total) || 0;
      if (r.kind === 'receivable') cur.in += total;
      if (r.kind === 'payable') cur.out += total;
      byDate.set(date, cur);
    }

    const series: CashFlowDayItem[] = [];
    let balance = cashToday;
    let balanceWithOverdue = cashTodayWithOverdue;
    const todayDate = new Date(todayStr + 'T12:00:00Z');

    for (let i = 0; i < days; i++) {
      const d = new Date(todayDate);
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const item = byDate.get(dateStr) ?? { in: 0, out: 0 };
      const net = item.in - item.out;
      balance += net;
      balanceWithOverdue += net;
      series.push({
        date: dateStr,
        in: item.in,
        out: item.out,
        net,
        balance: Math.round(balance * 100) / 100,
        balanceWithOverdue: Math.round(balanceWithOverdue * 100) / 100,
      });
    }

    const toDate = new Date(todayDate);
    toDate.setUTCDate(toDate.getUTCDate() + days - 1);
    const toStr = toDate.toISOString().slice(0, 10);

    return {
      days,
      from: todayStr,
      to: toStr,
      cashToday,
      overdueInTotal,
      overdueOutTotal,
      cashTodayWithOverdue,
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

/*
 * Teste manual obrigatório (após deploy no Railway):
 *
 * 1) GET /dashboard/cash-flow?days=30 com Authorization + X-Company-Id.
 *    - Confirmar: series[0].date = hoje (data do servidor/banco).
 *    - Confirmar: existe balanceWithOverdue em todos os itens.
 *    - Confirmar: cashTodayWithOverdue = cashToday + overdueInTotal - overdueOutTotal.
 *
 * 2) Criar no banco um installment vencido ontem (open) receivable e outro payable.
 *    - Confirmar: overdueInTotal e overdueOutTotal refletem esses valores.
 *    - Confirmar: series[0].balanceWithOverdue difere de series[0].balance
 *      exatamente pelo líquido dos atrasados (overdueInTotal - overdueOutTotal).
 */
