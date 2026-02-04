import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { InstallmentsController } from './installments.controller';
import { InstallmentsService } from './installments.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
