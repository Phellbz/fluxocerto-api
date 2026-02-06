import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { CompanyAccessService } from './company-access.service';

/**
 * Guard que valida X-Company-Id contra company_members e define req.companyId e req.companyRole.
 * Deve ser usado após JwtAuthGuard (req.user.sub deve existir).
 */
@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private readonly companyAccess: CompanyAccessService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.sub;
    const xCompanyId = req.headers['x-company-id'] as string | undefined;

    const access = await this.companyAccess.validateAndGetCompanyId(
      userId,
      xCompanyId,
    );
    (req as any).companyId = access.companyId;
    (req as any).companyRole = access.role;
    return true;
  }
}
