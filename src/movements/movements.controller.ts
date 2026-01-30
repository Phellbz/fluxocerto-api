import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MovementsService } from './movements.service';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';
import { CreateMovementDto } from './dto/create-movement.dto';

/** companyId vem sempre do JWT (req.user). Nunca aceitar do body/query. */
function getCompanyIdFromReq(req: {
  user?: { company_id?: string; companyId?: string };
}): string {
  const companyId = req.user?.company_id ?? req.user?.companyId;
  if (!companyId) {
    throw new BadRequestException(
      'companyId ausente no token (não é possível acessar movements)',
    );
  }
  return companyId;
}

@Controller('movements')
@UseGuards(JwtAuthGuard)
export class MovementsController {
  constructor(private readonly movementsService: MovementsService) {}

  @Get()
  async list(@Req() req: any, @Query() query: ListMovementsQueryDto) {
    const companyId = getCompanyIdFromReq(req);
    return this.movementsService.list(companyId, query);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateMovementDto) {
    const companyId = getCompanyIdFromReq(req);
    return this.movementsService.create(companyId, dto);
  }
}
