import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';

import { AuthModule } from './auth/auth.module';
import { MeController } from './me/me.controller';

import { PrismaModule } from './prisma/prisma.module';
import { MovementsController } from './movements/movements.controller';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AppController, HealthController, MeController, MovementsController],
  providers: [AppService],
})
export class AppModule {}
