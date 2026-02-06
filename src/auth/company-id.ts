import { BadRequestException } from '@nestjs/common';

/**
 * Retorna o companyId já validado pelo CompanyGuard (membership em company_members).
 * Use após @UseGuards(JwtAuthGuard, CompanyGuard). Não coloca company_id no JWT.
 */
export function getCompanyIdFromRequest(req: any): string {
  if (!req.companyId) {
    throw new BadRequestException(
      'Header X-Company-Id é obrigatório e deve ser validado (use CompanyGuard)',
    );
  }
  return req.companyId;
}
