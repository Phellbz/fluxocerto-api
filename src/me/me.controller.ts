import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('companies')
  async companies(@Req() req: { user?: { sub?: string } }) {
    const userId = req.user?.sub;
    if (!userId) return [];

    const members = await this.prisma.companyMember.findMany({
      where: { userId, isActive: true },
      include: { company: true },
    });
    return members.map((m) => ({
      id: m.company.id,
      name: m.company.name,
      document: m.company.document ?? undefined,
      is_active: m.company.isActive,
    }));
  }
}
