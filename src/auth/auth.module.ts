import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompanyGuard } from './company.guard';
import { CompanyAccessService } from './company-access.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      signOptions: { expiresIn: '15m' },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, CompanyGuard, CompanyAccessService],
  exports: [JwtModule, JwtAuthGuard, CompanyGuard, CompanyAccessService],
})
export class AuthModule {}
