import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PrismaModule, AuthModule, BankAccountsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
