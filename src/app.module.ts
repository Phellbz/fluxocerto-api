import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { AuthModule } from './auth/auth.module';
import { MeController } from './me/me.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { MovementsModule } from './movements/movements.module';

import { CategoriesController } from './categories/categories.controller';
import { ContactsController } from './contacts/contacts.controller';
import { BankAccountsController } from './bank-accounts/bank-accounts.controller';
import { DepartmentsController } from './departments/departments.controller';

@Module({
  imports: [AuthModule, PrismaModule, MovementsModule],
  controllers: [
    AppController,
    HealthController,
    MeController,
    CategoriesController,
    ContactsController,
    BankAccountsController,
    DepartmentsController,
  ],
  providers: [AppService],
})
export class AppModule {}
