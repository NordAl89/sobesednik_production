import { Controller, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Post('login')
  login(@Body() body: { login: string; password: string }) {
    const isValid = this.adminService.validateAdmin(body.login, body.password);

    if (isValid) {
      return { success: true };
    }
  }
}
