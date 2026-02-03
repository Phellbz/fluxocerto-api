import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.department.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    companyId: string,
    _user: Record<string, unknown>,
    dto: CreateDepartmentDto,
  ) {
    const data = {
      companyId,
      name: (dto.name ?? '').toString().trim() || '',
      description:
        dto.description != null && dto.description !== ''
          ? dto.description.trim()
          : null,
      isActive: dto.isActive ?? null,
    };

    console.log('[departments] prisma.create data', data);

    return this.prisma.department.create({ data });
  }

  async update(companyId: string, id: string, dto: UpdateDepartmentDto) {
    const existing = await this.prisma.department.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Departamento não encontrado ou não pertence à empresa',
      );
    }

    const data: Record<string, unknown> = {};
    if (dto.name !== undefined)
      data.name = (dto.name ?? '').toString().trim() || '';
    if (dto.description !== undefined)
      data.description =
        dto.description != null && dto.description !== ''
          ? dto.description.trim()
          : null;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    console.log('[departments] prisma.update data', { companyId, id, data });

    return this.prisma.department.update({
      where: { id },
      data,
    });
  }
}
