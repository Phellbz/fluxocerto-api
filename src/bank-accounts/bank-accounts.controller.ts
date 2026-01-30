import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

/** companyId vem do header X-Company-Id. Valida que o usuário (JWT) pertence à empresa. Não aceitar company_id do body. */
function getCompanyIdFromRequest(
  req: { user?: { company_id?: string; companyId?: string } },
  xCompanyId: string | undefined,
): string {
  const companyId = (xCompanyId || '').trim();
  if (!companyId) {
    throw new BadRequestException('Header X-Company-Id é obrigatório');
  }
  const jwtCompanyId = req.user?.company_id ?? req.user?.companyId;
  if (!jwtCompanyId) {
    throw new BadRequestException('company_id ausente no token');
  }
  if (jwtCompanyId !== companyId) {
    throw new ForbiddenException(
      'Usuário não pertence à empresa informada em X-Company-Id',
    );
  }
  return companyId;
}

/**
 * Exemplo de teste (sanity check):
 *
 * # Listar (requer JWT + X-Company-Id)
 * curl -s -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: c_1" https://fluxocerto-api-production.up.railway.app/bank-accounts
 *
 * # Criar conta com novos campos
 * curl -s -X POST https://fluxocerto-api-production.up.railway.app/bank-accounts \
 *   -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: c_1" -H "Content-Type: application/json" \
 *   -d '{"name":"Conta Corrente","institution":"Banco X","accountType":"checking","openingBalance":1000.50,"openingBalanceDate":"2025-01-01","isActive":true,"agency":"1234","accountNumber":"56789-0"}'
 *
 * # Atualizar conta (PATCH)
 * curl -s -X PATCH https://fluxocerto-api-production.up.railway.app/bank-accounts/ID_DA_CONTA \
 *   -H "Authorization: Bearer SEU_JWT" -H "X-Company-Id: c_1" -H "Content-Type: application/json" \
 *   -d '{"openingBalance":2000,"isActive":false}'
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
}
