import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { CategoriesService } from './categories.service';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.categoriesService.list(companyId);
  }

  @Post()
  async create(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);

    const name = (body?.name != null ? String(body.name) : '').trim();
    if (!name) throw new BadRequestException('name is required');

    const groupName = (body?.groupName != null ? String(body.groupName) : '').trim() || '';

    return this.prisma.category.create({
      data: { companyId, name, groupName },
    });
  }
}
