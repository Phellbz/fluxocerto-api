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
import { ContactsController } from './contacts/contacts.controller';
import { DepartmentsController } from './departments/departments.controller';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    MovementsModule,
    BankAccountsModule,
    CategoriesModule,
  ],
  controllers: [
    AppController,
    HealthController,
    MeController,
    ContactsController,
    DepartmentsController,
  ],
  providers: [AppService],
})
export class AppModule {}
