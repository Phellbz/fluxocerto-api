import {
  Body,
  Controller,
  Delete,
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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.budgetsService.list(companyId);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.budgetsService.getById(companyId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateBudgetDto) {
    const companyId = getCompanyIdFromRequest(req);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.budgetsService.create(companyId, userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateBudgetDto,
  ) {
    const companyId = getCompanyIdFromRequest(req);
    const userId = req.user?.sub ?? req.user?.id ?? null;
    return this.budgetsService.update(companyId, id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.budgetsService.remove(companyId, id);
  }
}
