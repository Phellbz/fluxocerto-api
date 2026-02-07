import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsString()
  @MinLength(1)
  serviceCode: string;

  @IsString()
  @MinLength(1)
  shortDescription: string;

  @IsString()
  @MinLength(1)
  serviceTaxation: string;

  @IsOptional()
  @IsString()
  integrationCode?: string;

  @IsOptional()
  @IsString()
  municipalServiceCode?: string;

  @IsOptional()
  @IsString()
  lc116Code?: string;

  @IsOptional()
  @IsString()
  nbsCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPriceCents?: number;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  issRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withholdIss?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pisRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withholdPis?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cofinsRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withholdCofins?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  csllRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withholdCsll?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  irRate?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  withholdIr?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
