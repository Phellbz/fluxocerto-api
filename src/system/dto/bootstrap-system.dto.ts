import { IsEmail, IsString, MinLength } from 'class-validator';

export class BootstrapSystemDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;
}
