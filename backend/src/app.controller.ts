import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Experts API is running!';
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('info')
  getInfo(): {
    name: string;
    version: string;
    environment: string;
  } {
    return {
      name: 'Experts API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
