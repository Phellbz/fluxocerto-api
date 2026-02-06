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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard, CompanyGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async list(@Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.productsService.list(companyId);
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.productsService.getById(companyId, id);
  }

  @Post()
  async create(@Req() req: any, @Body() dto: CreateProductDto) {
    const companyId = getCompanyIdFromRequest(req);
    return this.productsService.create(companyId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateProductDto,
  ) {
    const companyId = getCompanyIdFromRequest(req);
    return this.productsService.update(companyId, id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const companyId = getCompanyIdFromRequest(req);
    return this.productsService.remove(companyId, id);
  }
}
