import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';

@Injectable()
export class MovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string, query: ListMovementsQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: { companyId: string; occurredAt?: { gte?: Date; lte?: Date } } =
      { companyId };

    if (query.from || query.to) {
      where.occurredAt = {};
      if (query.from) {
        const fromDate = new Date(query.from);
        if (Number.isNaN(fromDate.getTime())) {
          throw new BadRequestException('from deve ser uma data válida');
        }
        where.occurredAt.gte = fromDate;
      }
      if (query.to) {
        const toDate = new Date(query.to);
        if (Number.isNaN(toDate.getTime())) {
          throw new BadRequestException('to deve ser uma data válida');
        }
        where.occurredAt.lte = toDate;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.movement.findMany({
        where,
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.movement.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async create(companyId: string, dto: CreateMovementDto) {
    await this.validateRelatedIds(companyId, dto);

    const occurredAt = new Date(dto.occurredAt);
    if (Number.isNaN(occurredAt.getTime())) {
      throw new BadRequestException('occurredAt inválido');
    }

    return this.prisma.movement.create({
      data: {
        companyId,
        occurredAt,
        description: (dto.description ?? '').trim() || '',
        amountCents: dto.amountCents,
        direction: dto.direction,
        categoryId: dto.categoryId ?? null,
        bankAccountId: dto.bankAccountId ?? null,
        contactId: dto.contactId ?? null,
        departmentId: dto.departmentId ?? null,
      },
    });
  }

  private async validateRelatedIds(
    companyId: string,
    dto: CreateMovementDto,
  ): Promise<void> {
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { id: dto.categoryId, companyId },
      });
      if (!category) {
        throw new NotFoundException(
          `Categoria com id ${dto.categoryId} não encontrada ou não pertence à empresa`,
        );
      }
    }
    if (dto.bankAccountId) {
      const bankAccount = await this.prisma.bankAccount.findFirst({
        where: { id: dto.bankAccountId, companyId },
      });
      if (!bankAccount) {
        throw new NotFoundException(
          `Conta bancária com id ${dto.bankAccountId} não encontrada ou não pertence à empresa`,
        );
      }
    }
    if (dto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: dto.contactId, companyId },
      });
      if (!contact) {
        throw new NotFoundException(
          `Contato com id ${dto.contactId} não encontrado ou não pertence à empresa`,
        );
      }
    }
    if (dto.departmentId) {
      const department = await this.prisma.department.findFirst({
        where: { id: dto.departmentId, companyId },
      });
      if (!department) {
        throw new NotFoundException(
          `Departamento com id ${dto.departmentId} não encontrado ou não pertence à empresa`,
        );
      }
    }
  }
}
