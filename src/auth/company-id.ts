import { BadRequestException, ForbiddenException } from '@nestjs/common';

/**
 * Obtém companyId do header X-Company-Id e valida que o usuário (JWT) pertence à empresa.
 * Não aceitar company_id do body.
 */
export function getCompanyIdFromRequest(
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
