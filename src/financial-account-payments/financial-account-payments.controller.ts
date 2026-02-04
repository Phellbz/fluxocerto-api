import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FinancialAccountPaymentsService } from './financial-account-payments.service';
import { CreateFinancialAccountPaymentDto } from './dto/create-payment.dto';

@Controller('financial-account-payments')
@UseGuards(JwtAuthGuard)
export class FinancialAccountPaymentsController {
  constructor(
    private readonly paymentsService: FinancialAccountPaymentsService,
  ) {}

  @Post()
  async create(
    @Req() req: { user?: { sub?: string; id?: string; company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateFinancialAccountPaymentDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.paymentsService.createPayment(companyId, userId, dto);
  }
}
