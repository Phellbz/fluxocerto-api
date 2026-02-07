import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

function toDecimal(value: number | null | undefined): Prisma.Decimal | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return new Prisma.Decimal(value);
  return null;
}

@Injectable()
export class ServicesCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    companyId: string,
    params: { query?: string; isActive?: 'true' | 'false'; take?: number; skip?: number },
  ) {
    const take = Math.min(200, Math.max(1, params.take ?? 50));
    const skip = Math.max(0, params.skip ?? 0);
    const activeFilter = params.isActive === 'false' ? false : params.isActive !== 'true' ? true : true;
    const search = (params.query ?? '').trim();

    const where: Prisma.ServiceWhereInput = { companyId, isActive: activeFilter };
    if (search) {
      where.OR = [
        { serviceCode: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { fullDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        orderBy: { serviceCode: 'asc' },
        take,
        skip,
      }),
      this.prisma.service.count({ where }),
    ]);

    return { items, total };
  }

  async getById(companyId: string, id: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, companyId },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à empresa');
    }
    return service;
  }

  async create(companyId: string, dto: CreateServiceDto) {
    const serviceCode = dto.serviceCode.trim();
    const existing = await this.prisma.service.findUnique({
      where: { companyId_serviceCode: { companyId, serviceCode } },
    });
    if (existing) {
      throw new ConflictException(
        'Já existe um serviço com este código (serviceCode) nesta empresa',
      );
    }

    const data: Prisma.ServiceCreateInput = {
      company: { connect: { id: companyId } },
      serviceCode,
      shortDescription: dto.shortDescription.trim(),
      serviceTaxation: dto.serviceTaxation.trim(),
      integrationCode: dto.integrationCode?.trim() ?? undefined,
      municipalServiceCode: dto.municipalServiceCode?.trim() ?? undefined,
      lc116Code: dto.lc116Code?.trim() ?? undefined,
      nbsCode: dto.nbsCode?.trim() ?? undefined,
      unitPriceCents: dto.unitPriceCents ?? undefined,
      fullDescription: dto.fullDescription?.trim() ?? undefined,
      issRate: toDecimal(dto.issRate),
      withholdIss: dto.withholdIss ?? false,
      pisRate: toDecimal(dto.pisRate),
      withholdPis: dto.withholdPis ?? false,
      cofinsRate: toDecimal(dto.cofinsRate),
      withholdCofins: dto.withholdCofins ?? false,
      csllRate: toDecimal(dto.csllRate),
      withholdCsll: dto.withholdCsll ?? false,
      irRate: toDecimal(dto.irRate),
      withholdIr: dto.withholdIr ?? false,
      isActive: dto.isActive ?? true,
    };

    return this.prisma.service.create({ data });
  }

  async update(companyId: string, id: string, dto: UpdateServiceDto) {
    const existing = await this.prisma.service.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à empresa');
    }

    if (dto.serviceCode !== undefined) {
      const code = dto.serviceCode.trim();
      if (code !== existing.serviceCode) {
        const conflict = await this.prisma.service.findUnique({
          where: { companyId_serviceCode: { companyId, serviceCode: code } },
        });
        if (conflict) {
          throw new ConflictException(
            'Já existe um serviço com este código (serviceCode) nesta empresa',
          );
        }
      }
    }

    const data: Prisma.ServiceUpdateInput = {};
    if (dto.serviceCode !== undefined) data.serviceCode = dto.serviceCode.trim();
    if (dto.shortDescription !== undefined) data.shortDescription = dto.shortDescription.trim();
    if (dto.serviceTaxation !== undefined) data.serviceTaxation = dto.serviceTaxation.trim();
    if (dto.integrationCode !== undefined) data.integrationCode = dto.integrationCode?.trim() ?? null;
    if (dto.municipalServiceCode !== undefined) data.municipalServiceCode = dto.municipalServiceCode?.trim() ?? null;
    if (dto.lc116Code !== undefined) data.lc116Code = dto.lc116Code?.trim() ?? null;
    if (dto.nbsCode !== undefined) data.nbsCode = dto.nbsCode?.trim() ?? null;
    if (dto.unitPriceCents !== undefined) data.unitPriceCents = dto.unitPriceCents;
    if (dto.fullDescription !== undefined) data.fullDescription = dto.fullDescription?.trim() ?? null;
    if (dto.issRate !== undefined) data.issRate = toDecimal(dto.issRate);
    if (dto.withholdIss !== undefined) data.withholdIss = dto.withholdIss;
    if (dto.pisRate !== undefined) data.pisRate = toDecimal(dto.pisRate);
    if (dto.withholdPis !== undefined) data.withholdPis = dto.withholdPis;
    if (dto.cofinsRate !== undefined) data.cofinsRate = toDecimal(dto.cofinsRate);
    if (dto.withholdCofins !== undefined) data.withholdCofins = dto.withholdCofins;
    if (dto.csllRate !== undefined) data.csllRate = toDecimal(dto.csllRate);
    if (dto.withholdCsll !== undefined) data.withholdCsll = dto.withholdCsll;
    if (dto.irRate !== undefined) data.irRate = toDecimal(dto.irRate);
    if (dto.withholdIr !== undefined) data.withholdIr = dto.withholdIr;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.service.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à empresa');
    }
    await this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
    return { id, isActive: false };
  }
}
