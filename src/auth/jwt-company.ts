import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export async function getCompanyIdFromAuthHeader(
  jwt: JwtService,
  authorization?: string,
): Promise<{ companyId: string }> {
  const token = (authorization || '').replace('Bearer ', '').trim();
  if (!token) throw new UnauthorizedException('Missing token');

  const payload = await jwt.verifyAsync(token);

  const companyId = payload?.company_id;
  if (!companyId)
    throw new UnauthorizedException('Missing company_id in token');

  return { companyId: String(companyId) };
}
