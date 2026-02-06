import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { AuthModule } from './auth/auth.module';
import { MeController } from './me/me.controller';
import { AdminModule } from './admin/admin.module';
import { SystemModule } from './system/system.module';
import { CompaniesModule } from './companies/companies.module';

import { PrismaModule } from '../prisma/prisma.module';
import { MovementsModule } from './movements/movements.module';

import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactsModule } from './contacts/contacts.module';
import { BudgetsModule } from './budgets/budgets.module';
import { DepartmentsModule } from './departments/departments.module';
import { ProductsModule } from './products/products.module';
import { FinancialAccountPaymentsModule } from './financial-account-payments/financial-account-payments.module';
import { FinancialAccountsModule } from './financial-accounts/financial-accounts.module';
import { InstallmentsModule } from './installments/installments.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    AuthModule,
    AdminModule,
    SystemModule,
    CompaniesModule,
    PrismaModule,
    MovementsModule,
    BankAccountsModule,
    CategoriesModule,
    ContactsModule,
    DepartmentsModule,
    BudgetsModule,
    ProductsModule,
    FinancialAccountPaymentsModule,
    FinancialAccountsModule,
    InstallmentsModule,
    DashboardModule,
  ],
  controllers: [AppController, HealthController, MeController],
  providers: [AppService],
})
export class AppModule {}
