import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

function toDecimal(
  v: number | string | null | undefined,
): string | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return null;
    return String(v);
  }
  const s = String(v).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? String(n) : null;
}

function str(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

function buildProductData(
  dto: CreateProductDto | UpdateProductDto,
  companyId: string,
): Prisma.ProductUncheckedCreateInput {
  return {
    companyId,
    codigoIntegracao: str(dto.codigoIntegracao) ?? undefined,
    codigoProduto: str(dto.codigoProduto) ?? undefined,
    descricao: str(dto.descricao) ?? undefined,
    ncm: str(dto.ncm) ?? undefined,
    unidade: str(dto.unidade) ?? undefined,
    familia: str(dto.familia) ?? undefined,
    marca: str(dto.marca) ?? undefined,
    modelo: str(dto.modelo) ?? undefined,
    tipo: str(dto.tipo) ?? undefined,
    localEstoque: str(dto.localEstoque) ?? undefined,
    estoqueMinimo: toDecimal(dto.estoqueMinimo) ?? undefined,
    estoqueAtual: toDecimal(dto.estoqueAtual) ?? undefined,
    estoqueInicial: toDecimal(dto.estoqueInicial) ?? undefined,
    precoCusto: toDecimal(dto.precoCusto) ?? undefined,
    precoVenda: toDecimal(dto.precoVenda) ?? undefined,
    pesoLiquido: toDecimal(dto.pesoLiquido) ?? undefined,
    pesoBruto: toDecimal(dto.pesoBruto) ?? undefined,
  };
}

function buildProductUpdateData(
  dto: UpdateProductDto,
): Prisma.ProductUpdateInput {
  const data: Prisma.ProductUpdateInput = {};
  if (dto.codigoIntegracao !== undefined)
    data.codigoIntegracao = str(dto.codigoIntegracao);
  if (dto.codigoProduto !== undefined)
    data.codigoProduto = (str(dto.codigoProduto) ?? '').trim() || '';
  if (dto.descricao !== undefined)
    data.descricao = (str(dto.descricao) ?? '').trim() || '';
  if (dto.ncm !== undefined) data.ncm = str(dto.ncm);
  if (dto.unidade !== undefined) data.unidade = str(dto.unidade);
  if (dto.familia !== undefined) data.familia = str(dto.familia);
  if (dto.marca !== undefined) data.marca = str(dto.marca);
  if (dto.modelo !== undefined) data.modelo = str(dto.modelo);
  if (dto.tipo !== undefined) data.tipo = str(dto.tipo);
  if (dto.localEstoque !== undefined)
    data.localEstoque = str(dto.localEstoque);
  if (dto.estoqueMinimo !== undefined)
    data.estoqueMinimo = toDecimal(dto.estoqueMinimo);
  if (dto.estoqueAtual !== undefined)
    data.estoqueAtual = toDecimal(dto.estoqueAtual);
  if (dto.estoqueInicial !== undefined)
    data.estoqueInicial = toDecimal(dto.estoqueInicial);
  if (dto.precoCusto !== undefined)
    data.precoCusto = toDecimal(dto.precoCusto);
  if (dto.precoVenda !== undefined)
    data.precoVenda = toDecimal(dto.precoVenda);
  if (dto.pesoLiquido !== undefined)
    data.pesoLiquido = toDecimal(dto.pesoLiquido);
  if (dto.pesoBruto !== undefined)
    data.pesoBruto = toDecimal(dto.pesoBruto);
  return data;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(companyId: string, id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!product) {
      throw new NotFoundException(
        'Produto não encontrado ou não pertence à empresa',
      );
    }
    return product;
  }

  async create(companyId: string, dto: CreateProductDto) {
    const data = buildProductData(dto, companyId);
    return this.prisma.product.create({ data });
  }

  async update(companyId: string, id: string, dto: UpdateProductDto) {
    const existing = await this.prisma.product.findFirst({
      where: { id, companyId },
    });
    if (!existing) {
      throw new NotFoundException(
        'Produto não encontrado ou não pertence à empresa',
      );
    }
    const data = buildProductUpdateData(dto);
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(companyId: string, id: string) {
    const result = await this.prisma.product.deleteMany({
      where: { id, companyId },
    });
    if (result.count === 0) {
      throw new NotFoundException(
        'Produto não encontrado ou não pertence à empresa',
      );
    }
    return { deleted: true, id };
  }
}
