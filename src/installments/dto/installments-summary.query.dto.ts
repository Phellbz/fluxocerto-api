import { IsNotEmpty, IsString } from 'class-validator';

export class InstallmentsSummaryQueryDto {
  @IsNotEmpty({ message: 'financialAccountIds é obrigatório' })
  @IsString()
  financialAccountIds!: string;
}
