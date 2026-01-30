import { IsOptional, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListMovementsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'page deve ser >= 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'limit deve ser >= 1' })
  @Max(100, { message: 'limit deve ser <= 100' })
  limit?: number = 20;

  /** Data inicial (ISO ou YYYY-MM-DD). Filtra movements com occurredAt >= from */
  @IsOptional()
  @IsDateString(
    {},
    { message: 'from deve ser uma data válida (ISO ou YYYY-MM-DD)' },
  )
  from?: string;

  /** Data final (ISO ou YYYY-MM-DD). Filtra movements com occurredAt <= to */
  @IsOptional()
  @IsDateString(
    {},
    { message: 'to deve ser uma data válida (ISO ou YYYY-MM-DD)' },
  )
  to?: string;
}
