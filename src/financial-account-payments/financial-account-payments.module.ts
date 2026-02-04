import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { FinancialAccountPaymentsController } from './financial-account-payments.controller';
import { FinancialAccountPaymentsService } from './financial-account-payments.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [FinancialAccountPaymentsController],
  providers: [FinancialAccountPaymentsService],
  exports: [FinancialAccountPaymentsService],
})
export class FinancialAccountPaymentsModule {}
