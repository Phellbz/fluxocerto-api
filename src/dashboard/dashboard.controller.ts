import { Controller, Get, Headers, Req, UseGuards } from '@nestjs/common';
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
}
