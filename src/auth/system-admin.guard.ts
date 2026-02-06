import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * Guard que exige req.user.isSystemAdmin === true.
 * Deve ser usado após JwtAuthGuard.
 */
@Injectable()
export class SystemAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.user?.isSystemAdmin === true) return true;
    throw new ForbiddenException('Acesso restrito a System Admin');
  }
}
