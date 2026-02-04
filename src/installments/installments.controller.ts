import {
  Controller,
  Get,
  Headers,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  InstallmentsService,
  ListInstallmentsQuery,
} from './installments.service';

@Controller('installments')
@UseGuards(JwtAuthGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Query('status') status?: 'open' | 'partial' | 'paid',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('kind') kind?: 'payable' | 'receivable',
    @Query('financialAccountId') financialAccountId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const query: ListInstallmentsQuery = {
      status,
      from,
      to,
      kind,
      financialAccountId,
      limit,
      offset,
    };
    return this.installmentsService.list(companyId, query);
  }
}
