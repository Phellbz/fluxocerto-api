import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyGuard } from '../auth/company.guard';
import { CompanyRoleGuard } from '../auth/company-role.guard';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompaniesService } from './companies.service';
import { CreateMemberDto } from './dto/create-member.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Post(':companyId/members')
  @UseGuards(CompanyGuard, CompanyRoleGuard)
  async addMember(
    @Param('companyId') companyId: string,
    @Body() body: CreateMemberDto,
    @Req() req: any,
  ) {
    const contextCompanyId = getCompanyIdFromRequest(req);
    if (contextCompanyId !== companyId) {
      throw new BadRequestException('X-Company-Id deve ser igual ao companyId da URL');
    }
    return this.companies.addMember(companyId, {
      name: body.name,
      email: body.email,
      role: body.role,
      tempPassword: body.tempPassword,
    });
  }

  @Get(':companyId/members')
  @UseGuards(CompanyGuard, CompanyRoleGuard)
  async listMembers(
    @Param('companyId') companyId: string,
    @Req() req: any,
  ) {
    const contextCompanyId = getCompanyIdFromRequest(req);
    if (contextCompanyId !== companyId) {
      throw new BadRequestException('X-Company-Id deve ser igual ao companyId da URL');
    }
    return this.companies.listMembers(companyId);
  }
}
