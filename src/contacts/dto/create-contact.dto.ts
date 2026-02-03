import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @IsIn(['customer', 'supplier', 'both'])
  type: 'customer' | 'supplier' | 'both';

  @IsString()
  document: string;

  @IsString()
  name: string;

  @IsString()
  tradeName: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  neighborhood?: string | null;

  @IsOptional()
  @IsString()
  zipCode?: string | null;
}
