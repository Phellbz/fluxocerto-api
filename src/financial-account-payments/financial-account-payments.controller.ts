import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialAccountPaymentsService } from './financial-account-payments.service';
import { CreateFinancialAccountPaymentDto } from './dto/create-payment.dto';

@Controller('financial-account-payments')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class FinancialAccountPaymentsController {
  constructor(
    private readonly paymentsService: FinancialAccountPaymentsService,
  ) {}

  @Get()
  async list(@Req() req: any, @Query('financialAccountId') financialAccountId?: string) {
    const companyId = getCompanyIdFromRequest(req);
    const accountId = (financialAccountId ?? '').trim();
    if (!accountId) {
      throw new BadRequestException(
        'Query param financialAccountId é obrigatório',
      );
    }
    return this.paymentsService.listByFinancialAccount(companyId, accountId);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateFinancialAccountPaymentDto) {
    const companyId = getCompanyIdFromRequest(req);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.paymentsService.createPayment(companyId, userId, dto);
  }
}
