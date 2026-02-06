import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.categoriesService.list(companyId);
  }

  @Post('bootstrap')
  async bootstrap(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    const result = await this.categoriesService.bootstrapDefaults(companyId);
    return { ok: true, ...result };
  }

  @Post()
  async create(@Req() req: any, @Body() body: Record<string, unknown>) {
    const companyId = getCompanyIdFromRequest(req);

    const name = (body?.name != null ? String(body.name) : '').trim();
    if (!name) throw new BadRequestException('name is required');

    const groupName = (body?.groupName != null ? String(body.groupName) : '').trim() || '';

    return this.prisma.category.create({
      data: { companyId, name, groupName },
    });
  }
}
