import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { AuthModule } from './auth/auth.module';
import { MeController } from './me/me.controller';

@Module({
  imports: [AuthModule],
  controllers: [AppController, HealthController, MeController],
  providers: [AppService],
})
export class AppModule {}
