import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SettleInstallmentDto {
  @IsOptional()
  @IsNumber()
  @Min(0.01, { message: 'paidAmount deve ser maior que zero' })
  @Type(() => Number)
  paidAmount?: number;

  @IsOptional()
  @IsString()
  paymentDate?: string;

  @IsOptional()
  @IsUUID()
  bankAccountId?: string | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
