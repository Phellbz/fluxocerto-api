import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { ServicesCatalogService } from './services-catalog.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';

@Controller('services')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class ServicesCatalogController {
  constructor(private readonly catalog: ServicesCatalogService) {}

  @Get()
  async list(@Req() req: any, @Query() query: ListServicesQueryDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.catalog.list(companyId, {
      query: query.query,
      isActive: query.isActive,
      take: query.take,
      skip: query.skip,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.catalog.getById(companyId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateServiceDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.catalog.create(companyId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateServiceDto,
  ) {
    const companyId = getCompanyIdFromRequest(req);
    return this.catalog.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.catalog.remove(companyId, id);
  }
}
