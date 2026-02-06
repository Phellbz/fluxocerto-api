import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialAccountsService } from './financial-accounts.service';
import { CreateFinancialAccountDto } from './dto/create-financial-account.dto';

@Controller('financial-accounts')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class FinancialAccountsController {
  constructor(
    private readonly financialAccountsService: FinancialAccountsService,
  ) {}

  @Get()
  async list(@Req() req: any, @Query('kind') kind?: 'payable' | 'receivable') {
    const companyId = getCompanyIdFromRequest(req);
    return this.financialAccountsService.list(companyId, kind ?? undefined);
  }

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.financialAccountsService.getById(companyId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFinancialAccountDto) {
    const companyId = getCompanyIdFromRequest(req);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.financialAccountsService.create(companyId, userId, dto);
  }
}
