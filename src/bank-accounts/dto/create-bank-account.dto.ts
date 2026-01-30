import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  Allow,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Aceita camelCase (preferido) ou snake_case vindo do frontend. */
export class CreateBankAccountDto {
  @IsNotEmpty({ message: 'name é obrigatório' })
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  institution?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  accountType?: string | null;

  /** snake_case alternativo (frontend pode enviar account_type) */
  @IsOptional()
  @Allow()
  account_type?: string | null;

  /** Valor numérico ou string. Persistido como Decimal. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  openingBalance?: number | null;

  @IsOptional()
  @Allow()
  opening_balance?: number | string | null;

  /** Data em ISO ou YYYY-MM-DD. Persistido como date (sem horário). */
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
