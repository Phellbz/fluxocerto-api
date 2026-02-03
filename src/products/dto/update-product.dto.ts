import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  codigoIntegracao?: string | null;

  @IsOptional()
  @IsString()
  codigoProduto?: string | null;

  @IsOptional()
  @IsString()
  descricao?: string | null;

  @IsOptional()
  @IsString()
  ncm?: string | null;

  @IsOptional()
  @IsString()
  unidade?: string | null;

  @IsOptional()
  @IsString()
  familia?: string | null;

  @IsOptional()
  @IsString()
  marca?: string | null;

  @IsOptional()
  @IsString()
  modelo?: string | null;

  @IsOptional()
  @IsString()
  tipo?: string | null;

  @IsOptional()
  @IsString()
  localEstoque?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueMinimo?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueAtual?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estoqueInicial?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precoCusto?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  precoVenda?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pesoLiquido?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pesoBruto?: number | null;
}
