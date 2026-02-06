import { IsObject, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CompanyInputDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  document?: string;
}

class OwnerInputDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  email: string;
}

export class CreateCompanyWithOwnerDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CompanyInputDto)
  company: CompanyInputDto;

  @IsObject()
  @ValidateNested()
  @Type(() => OwnerInputDto)
  owner: OwnerInputDto;

  @IsString()
  @MinLength(6)
  @IsOptional()
  tempPassword?: string;
}
