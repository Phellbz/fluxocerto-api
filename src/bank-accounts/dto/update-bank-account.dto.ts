import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
  Allow,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Aceita camelCase (preferido) ou snake_case vindo do frontend. */
export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  institution?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountType?: string | null;

  @IsOptional()
  @Allow()
  account_type?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  openingBalance?: number | null;

  @IsOptional()
  @Allow()
  opening_balance?: number | string | null;

  @IsOptional()
  @IsDateString()
  openingBalanceDate?: string | null;

  @IsOptional()
  @Allow()
  opening_balance_date?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean | null;

  @IsOptional()
  @Allow()
  is_active?: boolean | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agency?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string | null;

  @IsOptional()
  @Allow()
  account_number?: string | null;
}
