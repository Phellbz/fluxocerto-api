import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null;
}
