import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('cash-today')
  async cashToday(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.dashboardService.getCashToday(companyId);
  }

  @Get('cash-flow')
  async cashFlow(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Query('days') daysParam?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const days = Math.min(
      365,
      Math.max(1, parseInt(daysParam ?? '30', 10) || 30),
    );
    if (!Number.isFinite(days) || days < 1 || days > 365) {
      throw new BadRequestException('days deve ser entre 1 e 365');
    }
    return this.dashboardService.getCashFlow(companyId, days);
  }
}
