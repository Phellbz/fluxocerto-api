import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CompanyAccess {
  companyId: string;
  role: string;
}

/**
 * Valida que o usuário (req.user.sub) pertence à empresa do header X-Company-Id
 * via company_members. Retorna companyId e role; lança 400/403 se inválido.
 */
@Injectable()
export class CompanyAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndGetCompanyId(
    userId: string,
    xCompanyId: string | undefined,
  ): Promise<CompanyAccess> {
    const companyId = (xCompanyId ?? '').trim();
    if (!companyId) {
      throw new BadRequestException('Header X-Company-Id é obrigatório');
    }
    if (!userId) {
      throw new BadRequestException('Usuário não autenticado');
    }

    const member = await this.prisma.companyMember.findFirst({
      where: { companyId, userId, isActive: true },
      select: { companyId: true, role: true },
    });
    if (!member) {
      throw new ForbiddenException(
        'Usuário não pertence à empresa informada em X-Company-Id',
      );
    }
    return { companyId: member.companyId, role: member.role };
  }
}
