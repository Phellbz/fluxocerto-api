import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  // MVP: usuário fixo (vamos trocar por banco depois)
  private user = {
    id: 'u_1',
    email: 'admin@local',
    name: 'Admin',
    role: 'owner',
    // senha: 123456
    passwordHash: bcrypt.hashSync('123456', 10),
    company: { id: 'c_1', name: 'Minha Empresa' },
  };

  async login(email: string, password: string) {
    if (email !== this.user.email) return null;

    const ok = await bcrypt.compare(password, this.user.passwordHash);
    if (!ok) return null;

    const token = await this.jwt.signAsync({
      sub: this.user.id,
      email: this.user.email,
      role: this.user.role,
      company_id: this.user.company.id,
    });

    return {
      APP_SESSION_TOKEN: token,
      APP_USER: {
        id: this.user.id,
        email: this.user.email,
        name: this.user.name,
        role: this.user.role,
      },
    };
  }
}
