import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AdminService {
  validateAdmin(login: string, password: string): boolean {
    const adminLogin = process.env.ADMIN_LOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (login === adminLogin && password === adminPassword) {
      return true;
    }

    throw new UnauthorizedException('Неверный логин или пароль администратора');
  }
}
