import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsIn,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InstallmentItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  installmentNumber: number;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class CreateFinancialAccountDto {
  @IsString()
  @IsIn(['payable', 'receivable'])
  kind: 'payable' | 'receivable';

  @IsString()
  contactId: string;

  @IsOptional()
  @IsString()
  categoryId?: string | null;

  @IsOptional()
  @IsString()
  departmentId?: string | null;

  @IsOptional()
  @IsString()
  bankAccountId?: string | null;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string | null;

  @IsDateString()
  issueDate: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  totalAmount: number;

  @IsOptional()
  @IsString()
  observations?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstallmentItemDto)
  installments?: InstallmentItemDto[] | null;
}
