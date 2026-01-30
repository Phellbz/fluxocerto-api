import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { getCompanyIdFromAuthHeader } from '../auth/jwt-company';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async list(@Headers('authorization') authorization?: string) {
    const { companyId } = await getCompanyIdFromAuthHeader(
      this.jwt,
      authorization,
    );
    return this.prisma.category.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: any,
  ) {
    const { companyId } = await getCompanyIdFromAuthHeader(
      this.jwt,
      authorization,
    );

    const name = (body?.name || '').trim();
    if (!name) throw new BadRequestException('name is required');

    const groupName = body?.groupName ? String(body.groupName).trim() : null;

    return this.prisma.category.create({
      data: { companyId, name, groupName },
    });
  }
}
