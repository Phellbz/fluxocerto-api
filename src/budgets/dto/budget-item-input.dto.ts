import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetItemInputDto {
  /** PRODUCT | SERVICE | material (legacy = product) */
  @IsOptional()
  @IsString()
  itemType?: 'PRODUCT' | 'SERVICE' | 'product' | 'service' | 'material' | string;

  @IsOptional()
  @IsString()
  productId?: string | null;

  @IsOptional()
  @IsString()
  serviceId?: string | null;

  /** Override unit price in cents for this line (used with SERVICE) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPriceCents?: number | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  detailedDescription?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  unitPrice?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountPercent?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lineTotal?: number | string | null;
}
