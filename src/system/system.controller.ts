import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SystemAdminGuard } from '../auth/system-admin.guard';
import { SystemService } from './system.service';
import { BootstrapSystemDto } from './dto/bootstrap-system.dto';
import { CreateCompanyWithOwnerDto } from './dto/create-company-with-owner.dto';

@Controller('system')
export class SystemController {
  constructor(private readonly system: SystemService) {}

  @Post('bootstrap')
  async bootstrap(
    @Headers('x-system-bootstrap-secret') secret: string | undefined,
    @Body() body: BootstrapSystemDto,
  ) {
    return this.system.bootstrapSystemAdmin(secret, {
      email: body.email,
      name: body.name,
      password: body.password,
    });
  }

  @Post('companies')
  @UseGuards(JwtAuthGuard, SystemAdminGuard)
  async createCompanyWithOwner(@Body() body: CreateCompanyWithOwnerDto) {
    return this.system.createCompanyWithOwner({
      company: { name: body.company.name, document: body.company.document },
      owner: { name: body.owner.name, email: body.owner.email },
      tempPassword: body.tempPassword,
    });
  }
}
