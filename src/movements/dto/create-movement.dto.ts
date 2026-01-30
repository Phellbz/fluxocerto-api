import {
  IsNotEmpty,
  IsNumber,
  Min,
  IsIn,
  IsOptional,
  IsUUID,
  IsDateString,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateMovementDto {
  @IsNotEmpty({ message: 'occurredAt é obrigatório' })
  @IsDateString({}, { message: 'occurredAt deve ser uma data válida (ISO ou YYYY-MM-DD)' })
  occurredAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsNotEmpty({ message: 'amountCents é obrigatório' })
  @IsNumber()
  @Min(1, { message: 'amountCents deve ser maior que 0' })
  amountCents: number;

  @IsNotEmpty({ message: 'direction é obrigatório' })
  @IsIn(['in', 'out'], { message: 'direction deve ser "in" ou "out"' })
  direction: 'in' | 'out';

  @IsOptional()
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'bankAccountId deve ser um UUID válido' })
  bankAccountId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'contactId deve ser um UUID válido' })
  contactId?: string | null;

  @IsOptional()
  @IsUUID('4', { message: 'departmentId deve ser um UUID válido' })
  departmentId?: string | null;
}
