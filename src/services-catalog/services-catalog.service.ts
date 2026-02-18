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

    const where: Prisma.ServiceWhereInput = {
      companyId,
      deletedAt: null,
      isActive: activeFilter,
    };
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
      where: { id, companyId, deletedAt: null },
    });
    if (!service) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à empresa');
    }
    return service;
  }

  async create(companyId: string, dto: CreateServiceDto) {
    const serviceCode = dto.serviceCode.trim();
    const existing = await this.prisma.service.findFirst({
      where: {
        companyId,
        serviceCode,
        deletedAt: null,
      },
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
      municipalServiceDescription: dto.municipalServiceDescription?.trim() ?? undefined,
      lc116Code: dto.lc116Code?.trim() ?? undefined,
      nbsCode: dto.nbsCode?.trim() ?? undefined,
      unitPriceCents: dto.unitPriceCents ?? undefined,
      fullDescription: dto.fullDescription?.trim() ?? undefined,
      defaultDeductionCents: dto.defaultDeductionCents ?? 0,
      defaultQuantity: toDecimal(dto.defaultQuantity),
      defaultDiscountRate: toDecimal(dto.defaultDiscountRate),
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
      inssRate: toDecimal(dto.inssRate),
      withholdInss: dto.withholdInss ?? false,
      deductIssFromPisCofinsBase: dto.deductIssFromPisCofinsBase ?? false,
      informTaxValueInsteadOfRate: dto.informTaxValueInsteadOfRate ?? false,
      nbsDescription: dto.nbsDescription?.trim() ?? undefined,
      ibptFederalRate: toDecimal(dto.ibptFederalRate) ?? new Prisma.Decimal(0),
      ibptStateRate: toDecimal(dto.ibptStateRate) ?? new Prisma.Decimal(0),
      ibptMunicipalRate: toDecimal(dto.ibptMunicipalRate) ?? new Prisma.Decimal(0),
      ibptSourceNote: dto.ibptSourceNote?.trim() ?? undefined,
      reformRecipient: dto.reformRecipient?.trim() ?? undefined,
      cstCode: dto.cstCode?.trim() ?? undefined,
      cstDescription: dto.cstDescription?.trim() ?? undefined,
      taxClassificationCode: dto.taxClassificationCode?.trim() ?? undefined,
      taxClassificationDescription: dto.taxClassificationDescription?.trim() ?? undefined,
      operationIndicatorCode: dto.operationIndicatorCode?.trim() ?? undefined,
      operationIndicatorDescription: dto.operationIndicatorDescription?.trim() ?? undefined,
      ibsMunicipalRate: toDecimal(dto.ibsMunicipalRate) ?? new Prisma.Decimal(0),
      ibsStateRate: toDecimal(dto.ibsStateRate) ?? new Prisma.Decimal(0),
      cbsRate: toDecimal(dto.cbsRate) ?? new Prisma.Decimal(0),
      personalUseConsumption: dto.personalUseConsumption ?? false,
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
        const conflict = await this.prisma.service.findFirst({
          where: { companyId, serviceCode: code, deletedAt: null },
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
    if (dto.municipalServiceDescription !== undefined) data.municipalServiceDescription = dto.municipalServiceDescription?.trim() ?? null;
    if (dto.defaultDeductionCents !== undefined) data.defaultDeductionCents = dto.defaultDeductionCents;
    if (dto.defaultQuantity !== undefined) data.defaultQuantity = toDecimal(dto.defaultQuantity);
    if (dto.defaultDiscountRate !== undefined) data.defaultDiscountRate = toDecimal(dto.defaultDiscountRate);
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
    if (dto.inssRate !== undefined) data.inssRate = toDecimal(dto.inssRate);
    if (dto.withholdInss !== undefined) data.withholdInss = dto.withholdInss;
    if (dto.deductIssFromPisCofinsBase !== undefined) data.deductIssFromPisCofinsBase = dto.deductIssFromPisCofinsBase;
    if (dto.informTaxValueInsteadOfRate !== undefined) data.informTaxValueInsteadOfRate = dto.informTaxValueInsteadOfRate;
    if (dto.nbsDescription !== undefined) data.nbsDescription = dto.nbsDescription?.trim() ?? null;
    if (dto.ibptFederalRate !== undefined) data.ibptFederalRate = toDecimal(dto.ibptFederalRate) ?? new Prisma.Decimal(0);
    if (dto.ibptStateRate !== undefined) data.ibptStateRate = toDecimal(dto.ibptStateRate) ?? new Prisma.Decimal(0);
    if (dto.ibptMunicipalRate !== undefined) data.ibptMunicipalRate = toDecimal(dto.ibptMunicipalRate) ?? new Prisma.Decimal(0);
    if (dto.ibptSourceNote !== undefined) data.ibptSourceNote = dto.ibptSourceNote?.trim() ?? null;
    if (dto.reformRecipient !== undefined) data.reformRecipient = dto.reformRecipient?.trim() ?? null;
    if (dto.cstCode !== undefined) data.cstCode = dto.cstCode?.trim() ?? null;
    if (dto.cstDescription !== undefined) data.cstDescription = dto.cstDescription?.trim() ?? null;
    if (dto.taxClassificationCode !== undefined) data.taxClassificationCode = dto.taxClassificationCode?.trim() ?? null;
    if (dto.taxClassificationDescription !== undefined) data.taxClassificationDescription = dto.taxClassificationDescription?.trim() ?? null;
    if (dto.operationIndicatorCode !== undefined) data.operationIndicatorCode = dto.operationIndicatorCode?.trim() ?? null;
    if (dto.operationIndicatorDescription !== undefined) data.operationIndicatorDescription = dto.operationIndicatorDescription?.trim() ?? null;
    if (dto.ibsMunicipalRate !== undefined) data.ibsMunicipalRate = toDecimal(dto.ibsMunicipalRate) ?? new Prisma.Decimal(0);
    if (dto.ibsStateRate !== undefined) data.ibsStateRate = toDecimal(dto.ibsStateRate) ?? new Prisma.Decimal(0);
    if (dto.cbsRate !== undefined) data.cbsRate = toDecimal(dto.cbsRate) ?? new Prisma.Decimal(0);
    if (dto.personalUseConsumption !== undefined) data.personalUseConsumption = dto.personalUseConsumption;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    return this.prisma.service.update({
      where: { id },
      data,
    });
  }

  async remove(companyId: string, id: string) {
    const existing = await this.prisma.service.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException('Serviço não encontrado ou não pertence à empresa');
    }
    await this.prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { id, deletedAt: new Date().toISOString() };
  }
}
