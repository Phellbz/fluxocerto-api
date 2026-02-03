import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { AuthModule } from './auth/auth.module';
import { MeController } from './me/me.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { MovementsModule } from './movements/movements.module';

import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactsModule } from './contacts/contacts.module';
import { BudgetsModule } from './budgets/budgets.module';
import { DepartmentsModule } from './departments/departments.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    MovementsModule,
    BankAccountsModule,
    CategoriesModule,
    ContactsModule,
    DepartmentsModule,
    BudgetsModule,
  ],
  controllers: [AppController, HealthController, MeController],
  providers: [AppService],
})
export class AppModule {}
