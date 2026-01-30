import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  /** Valor numérico ou string (ex: "1234.56"). Persistido como Decimal. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  openingBalance?: number | null;

  /** Data em ISO ou YYYY-MM-DD. Persistido como date (sem horário). */
  @IsOptional()
  @IsDateString()
  openingBalanceDate?: string | null;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  agency?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumber?: string | null;
}
