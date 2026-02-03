import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetItemInputDto {
  @IsOptional()
  @IsString()
  itemType?: 'service' | 'material' | string;

  @IsOptional()
  @IsString()
  productId?: string | null;

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
