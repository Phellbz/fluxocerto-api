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

@Controller('contacts')
export class ContactsController {
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
    return this.prisma.contact.findMany({
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

    const tradeName = (body?.tradeName != null ? String(body.tradeName).trim() : '') || '';

    return this.prisma.contact.create({
      data: { companyId, name, tradeName },
    });
  }
}
