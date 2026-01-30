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

@Controller('departments')
export class DepartmentsController {
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
    return this.prisma.department.findMany({
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

    return this.prisma.department.create({
      data: { companyId, name },
    });
  }
}
