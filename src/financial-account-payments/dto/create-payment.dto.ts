import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFinancialAccountPaymentDto {
  @IsUUID()
  financialAccountId: string;

  @IsOptional()
  @IsUUID()
  installmentId?: string | null;

  @IsOptional()
  @IsUUID()
  bankAccountId?: string | null;

  @IsString()
  paymentDate: string;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  paidAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interest?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  discount?: number;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
