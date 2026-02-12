import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
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
@UseGuards(JwtAuthGuard, CompanyGuard)
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.list(companyId);
  }

  @Get('overview')
  async overview(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.overview(companyId);
  }

  @Get('balances')
  async balances(@Req() req: any, @Res() res: Response) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    const companyId = getCompanyIdFromRequest(req);
    const data = await this.bankAccountsService.getBalances(companyId);
    res.setHeader('Content-Type', 'application/json');
    res.status(200).end(JSON.stringify(data));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.getById(companyId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateBankAccountDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.create(companyId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateBankAccountDto,
  ) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.bankAccountsService.remove(companyId, id);
  }
}
