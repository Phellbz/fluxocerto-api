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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.productsService.list(companyId);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId?: string,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.productsService.getById(companyId, id);
  }

  @Post()
  async create(
    @Req() req: {
      user?: {
        company_id?: string;
        companyId?: string;
        sub?: string;
        id?: string;
      };
    },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: CreateProductDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    const user = req.user as { sub?: string; id?: string } | undefined;

    console.log('[products] POST', {
      companyId,
      userId: user?.sub ?? user?.id,
    });

    return this.productsService.create(companyId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
    @Body() dto: UpdateProductDto,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);

    console.log('[products] PATCH', { companyId, id });

    return this.productsService.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: { user?: { company_id?: string; companyId?: string } },
    @Headers('x-company-id') xCompanyId: string | undefined,
  ) {
    const companyId = getCompanyIdFromRequest(req, xCompanyId);
    return this.productsService.remove(companyId, id);
  }
}
