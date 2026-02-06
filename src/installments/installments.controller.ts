import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  InstallmentsService,
  ListInstallmentsQuery,
} from './installments.service';
import { SettleInstallmentDto } from './dto/settle-installment.dto';

@Controller('installments')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Get()
  async list(
    @Req() req: any,
    @Query('status') status?: 'open' | 'partial' | 'paid',
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('kind') kind?: 'payable' | 'receivable',
    @Query('financialAccountId') financialAccountId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req);
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

  @Patch(':id')
  async settle(@Param('id') id: string, @Req() req: any, @Body() dto: SettleInstallmentDto) {
    const companyId = getCompanyIdFromRequest(req);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.installmentsService.settle(companyId, id, dto, userId);
  }
}
