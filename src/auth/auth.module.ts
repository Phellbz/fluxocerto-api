import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompanyGuard } from './company.guard';
import { CompanyAccessService } from './company-access.service';
import { SystemAdminGuard } from './system-admin.guard';
import { CompanyRoleGuard } from './company-role.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const s = config.get<string>('JWT_ACCESS_SECRET');
        if (!s) console.error('JWT_ACCESS_SECRET is missing');
        return {
          secret: s || 'dev-secret-change-me',
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
    PrismaModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    CompanyGuard,
    CompanyAccessService,
    SystemAdminGuard,
    CompanyRoleGuard,
  ],
  exports: [
    JwtModule,
    JwtAuthGuard,
    CompanyGuard,
    CompanyAccessService,
    SystemAdminGuard,
    CompanyRoleGuard,
  ],
})
export class AuthModule {}
