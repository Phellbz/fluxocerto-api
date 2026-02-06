import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/jwt-payload';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('companies')
  async companies(@Req() req: { user?: JwtPayload }) {
    const user = req.user;
    if (!user?.sub) return [];

    if (user.isSystemAdmin === true) {
      const companies = await this.prisma.company.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, document: true, isActive: true },
      });
      return companies.map((c) => ({
        id: c.id,
        name: c.name,
        document: c.document ?? undefined,
        is_active: c.isActive,
      }));
    }

    const members = await this.prisma.companyMember.findMany({
      where: { userId: user.sub, isActive: true },
      include: { company: true },
    });
    return members
      .filter((m) => m.company.isActive)
      .map((m) => ({
        id: m.company.id,
        name: m.company.name,
        document: m.company.document ?? undefined,
        is_active: m.company.isActive,
      }));
  }
}
