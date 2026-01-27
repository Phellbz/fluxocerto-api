import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type CreateMovementDto = {
  occurredAt: string; // ISO
  description: string;
  amountCents: number;
  direction: 'in' | 'out';
  categoryId?: string | null;
  bankAccountId?: string | null;
  contactId?: string | null;
  departmentId?: string | null;
};

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = req.user.company_id as string;

    return this.prisma.movement.findMany({
      where: { companyId },
      orderBy: { occurredAt: 'desc' },
    });
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMovementDto) {
    const companyId = req.user.company_id as string;

    return this.prisma.movement.create({
      data: {
        companyId,
        occurredAt: new Date(dto.occurredAt),
        description: dto.description,
        amountCents: dto.amountCents,
        direction: dto.direction,
        categoryId: dto.categoryId ?? null,
        bankAccountId: dto.bankAccountId ?? null,
        contactId: dto.contactId ?? null,
        departmentId: dto.departmentId ?? null,
      },
    });
  }
}
