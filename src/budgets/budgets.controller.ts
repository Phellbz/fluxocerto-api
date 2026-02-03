import {
  Body,
  Controller,
  Delete,
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
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.budgetsService.list(companyId);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.budgetsService.getById(companyId, id);
  }

  @Post()
  async create(
    @Req() req: { user?: { sub?: string; id?: string; company_id?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateBudgetDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const userId = req.user?.sub ?? req.user?.id ?? null;

    console.log('[budgets] POST', {
      companyId,
      userId: req.user?.sub ?? req.user?.id,
    });

    return this.budgetsService.create(companyId, userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: UpdateBudgetDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);

    console.log('[budgets] PATCH', { companyId, id });

    return this.budgetsService.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.budgetsService.remove(companyId, id);
  }
}
