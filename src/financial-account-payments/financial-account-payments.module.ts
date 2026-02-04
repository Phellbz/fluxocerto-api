import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialAccountPaymentsController } from './financial-account-payments.controller';
import { FinancialAccountPaymentsService } from './financial-account-payments.service';

@Module({
  imports: [PrismaModule],
  controllers: [FinancialAccountPaymentsController],
  providers: [FinancialAccountPaymentsService],
  exports: [FinancialAccountPaymentsService],
})
export class FinancialAccountPaymentsModule {}
