import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

/**
 * Smoke test — valor inicial e data do saldo inicial (openingBalance / openingBalanceDate):
 *
 * 1) Criar conta com openingBalance e openingBalanceDate:
 *    curl -s -X POST https://SEU_HOST/bank-accounts \
 *      -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: SEU_COMPANY_ID" -H "Content-Type: application/json" \
 *      -d '{"name":"Conta Teste","institution":"Banco X","accountType":"checking","openingBalance":1500.50,"openingBalanceDate":"2025-01-01"}'
 *    → Confirmar no retorno do POST que openingBalance e openingBalanceDate vêm preenchidos.
 *
 * 2) GET por id e LIST:
 *    curl -s -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: SEU_COMPANY_ID" https://SEU_HOST/bank-accounts
 *    curl -s -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: SEU_COMPANY_ID" https://SEU_HOST/bank-accounts/ID_DA_CONTA
 *    → Confirmar que openingBalance e openingBalanceDate aparecem em ambos.
 *
 * 3) Atualizar apenas openingBalanceDate (PATCH):
 *    curl -s -X PATCH https://SEU_HOST/bank-accounts/ID_DA_CONTA \
 *      -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: SEU_COMPANY_ID" -H "Content-Type: application/json" \
 *      -d '{"openingBalanceDate":"2025-02-01"}'
 *    → Confirmar persistência; openingBalance deve permanecer inalterado.
 *
 * 4) Atualizar sem mandar openingBalance/openingBalanceDate (ex.: só name):
 *    curl -s -X PATCH https://SEU_HOST/bank-accounts/ID_DA_CONTA \
 *      -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: SEU_COMPANY_ID" -H "Content-Type: application/json" \
 *      -d '{"name":"Conta Renomeada"}'
 *    → Garantir que NÃO zera: openingBalance e openingBalanceDate devem continuar com os valores anteriores.
 */
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.list(companyId);
  }

  @Get('overview')
  async overview(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.overview(companyId);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.getById(companyId, id);
  }

  @Post()
  async create(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateBankAccountDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.create(companyId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: UpdateBankAccountDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.bankAccountsService.remove(companyId, id);
  }
}
