import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

function toContactType(v: string | null | undefined): ContactType {
  const s = (v ?? '').toString().trim().toLowerCase();
  if (s === 'supplier') return ContactType.supplier;
  if (s === 'both') return ContactType.both;
  return ContactType.client;
}

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.contact.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    companyId: string,
    user: Record<string, unknown>,
    dto: CreateContactDto,
  ) {
    const data = {
      companyId,
      type: (dto.type ?? 'customer').trim() || 'customer',
      document: (dto.document ?? '').toString().trim(),
      name: (dto.name ?? '').toString().trim(),
      tradeName: (dto.tradeName ?? '').toString().trim(),
      phone: dto.phone != null && dto.phone !== '' ? dto.phone.trim() : null,
      email: dto.email != null && dto.email !== '' ? dto.email.trim() : null,
      city: dto.city != null && dto.city !== '' ? dto.city.trim() : null,
      state: dto.state != null && dto.state !== '' ? dto.state.trim() : null,
      address:
        dto.address != null && dto.address !== ''
          ? dto.address.trim()
          : null,
      neighborhood:
        dto.neighborhood != null && dto.neighborhood !== ''
          ? dto.neighborhood.trim()
          : null,
      zipCode:
        dto.zipCode != null && dto.zipCode !== '' ? dto.zipCode.trim() : null,
      createdBy:
        user?.sub != null || user?.id != null
          ? String(user.sub ?? user.id)
          : null,
    };

    console.log('[contacts] prisma.create data', data);

    return this.prisma.contact.create({
      data: data as Prisma.ContactUncheckedCreateInput,
    });
  }

  async update(companyId: string, id: string, dto: UpdateContactDto) {
    const existing = await this.prisma.contact.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Contato não encontrado ou não pertence à empresa',
      );
    }

    const data: Record<string, unknown> = {};

    if (dto.type !== undefined)
      data.type = toContactType(dto.type ?? 'customer');
    if (dto.document !== undefined)
      data.document = (dto.document ?? '').toString().trim();
    if (dto.name !== undefined)
      data.name = (dto.name ?? '').toString().trim();
    if (dto.tradeName !== undefined)
      data.tradeName = (dto.tradeName ?? '').toString().trim();
    if (dto.phone !== undefined)
      data.phone =
        dto.phone != null && dto.phone !== '' ? dto.phone.trim() : null;
    if (dto.email !== undefined)
      data.email =
        dto.email != null && dto.email !== '' ? dto.email.trim() : null;
    if (dto.city !== undefined)
      data.city =
        dto.city != null && dto.city !== '' ? dto.city.trim() : null;
    if (dto.state !== undefined)
      data.state =
        dto.state != null && dto.state !== '' ? dto.state.trim() : null;
    if (dto.address !== undefined)
      data.address =
        dto.address != null && dto.address !== ''
          ? dto.address.trim()
          : null;
    if (dto.neighborhood !== undefined)
      data.neighborhood =
        dto.neighborhood != null && dto.neighborhood !== ''
          ? dto.neighborhood.trim()
          : null;
    if (dto.zipCode !== undefined)
      data.zipCode =
        dto.zipCode != null && dto.zipCode !== '' ? dto.zipCode.trim() : null;

    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }
}
