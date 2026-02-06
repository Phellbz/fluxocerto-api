import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.departmentsService.list(companyId);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateDepartmentDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.departmentsService.create(
      companyId,
      (req.user ?? {}) as Record<string, unknown>,
      dto,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const companyId = getCompanyIdFromRequest(req);
    return this.departmentsService.update(companyId, id, dto);
  }
}
