import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsEmail()
  email: string;

  /** Role na empresa: owner, admin, financeiro, estoque, member */
  @IsString()
  @MinLength(1)
  role: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  tempPassword?: string;
}
