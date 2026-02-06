import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/** Roles que podem gerenciar membros da empresa (criar/convidar, listar). */
const MANAGER_ROLES = ['owner', 'admin', 'master'];

/**
 * Guard que exige ser System Admin OU ter role owner/admin/master na empresa (req.companyRole).
 * Deve ser usado após JwtAuthGuard e CompanyGuard.
 */
@Injectable()
export class CompanyRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.isSystemAdmin === true) return true;
    const role = (req.companyRole ?? '').toLowerCase();
    if (MANAGER_ROLES.includes(role)) return true;
    throw new ForbiddenException(
      'Acesso restrito a Owner, Admin ou System Admin',
    );
  }
}
