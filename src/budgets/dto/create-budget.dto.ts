import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BudgetItemInputDto } from './budget-item-input.dto';

export class CreateBudgetDto {
  @IsOptional()
  @IsString()
  budgetNumber?: string | null;

  @IsOptional()
  @IsString()
  status?: string | null;

  @IsOptional()
  @IsString()
  stage?: string | null;

  @IsOptional()
  @IsString()
  clientId?: string | null;

  @IsOptional()
  @IsString()
  clientName?: string | null;

  @IsOptional()
  @IsString()
  clientFullName?: string | null;

  @IsOptional()
  @IsString()
  clientDocument?: string | null;

  @IsOptional()
  @IsString()
  clientTags?: string | null;

  @IsOptional()
  @IsString()
  contactName?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalServices?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalMaterials?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalAmount?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValue?: number | string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  installmentCount?: number | null;

  @IsOptional()
  @IsString()
  paymentMethodLabel?: string | null;

  @IsOptional()
  @IsString()
  bankAccountId?: string | null;

  @IsOptional()
  @IsString()
  bankAccountName?: string | null;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  categoryName?: string | null;

  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @IsOptional()
  @IsString()
  advancePaymentStatus?: string | null;

  @IsOptional()
  @IsString()
  expectedBillingDate?: string | null;

  @IsOptional()
  @IsString()
  billedAt?: string | null;

  @IsOptional()
  @IsString()
  billedBy?: string | null;

  @IsOptional()
  @IsString()
  rpsDate?: string | null;

  @IsOptional()
  @IsString()
  clientOrderNumber?: string | null;

  @IsOptional()
  @IsString()
  sellerName?: string | null;

  @IsOptional()
  @IsString()
  projectName?: string | null;

  @IsOptional()
  @IsString()
  contractNumber?: string | null;

  @IsOptional()
  @IsString()
  constructionCode?: string | null;

  @IsOptional()
  @IsString()
  artCode?: string | null;

  @IsOptional()
  @IsString()
  productRemittance?: string | null;

  @IsOptional()
  @IsString()
  observations?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetItemInputDto)
  items?: BudgetItemInputDto[];
}
