import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsNumber()
  openingBalance?: number | null;

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
