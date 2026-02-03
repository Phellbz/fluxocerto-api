import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.departmentsService.list(companyId);
  }

  @Post()
  async create(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateDepartmentDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);

    console.log('[departments] POST body received', { companyId, dto });

    return this.departmentsService.create(
      companyId,
      (req.user ?? {}) as Record<string, unknown>,
      dto,
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: UpdateDepartmentDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.departmentsService.update(companyId, id, dto);
  }
}
