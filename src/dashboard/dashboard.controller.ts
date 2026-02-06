import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('cash-today')
  async cashToday(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.dashboardService.getCashToday(companyId);
  }

  @Get('cash-flow')
  async cashFlow(@Req() req: any, @Query('days') daysParam?: string) {
    const companyId = getCompanyIdFromRequest(req);
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
