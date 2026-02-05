import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialAccountsService } from './financial-accounts.service';
import { CreateFinancialAccountDto } from './dto/create-financial-account.dto';

@Controller('financial-accounts')
@UseGuards(JwtAuthGuard)
export class FinancialAccountsController {
  constructor(
    private readonly financialAccountsService: FinancialAccountsService,
  ) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Query('kind') kind?: 'payable' | 'receivable',
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.financialAccountsService.list(companyId, kind ?? undefined);
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.financialAccountsService.getById(companyId, id);
  }

  @Post()
  async create(
    @Req() req: {
      user?: { sub?: string; id?: string; company_id?: string; companyId?: string };
    },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateFinancialAccountDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.financialAccountsService.create(companyId, userId, dto);
  }
}
