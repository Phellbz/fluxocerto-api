import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { getCompanyIdFromRequest } from '../auth/company-id';
import { CompanyGuard } from '../auth/company.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MovementsService } from './movements.service';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';

@Controller('movements')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  async list(@Req() req: any, @Query() query: ListMovementsQueryDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.movementsService.list(companyId, query);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMovementDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.movementsService.create(companyId, dto);
  }
}
