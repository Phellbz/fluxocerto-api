import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ServicesCatalogController } from './services-catalog.controller';
import { ServicesCatalogService } from './services-catalog.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [ServicesCatalogController],
  providers: [ServicesCatalogService],
})
export class ServicesCatalogModule {}
