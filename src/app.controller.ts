import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealthCheck(): { status: string; message: string; timestamp: string } {
    return {
      status: 'healthy',
      message: 'Classified Ads API is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth(): { status: string; service: string } {
    return {
      status: 'ok',
      service: 'classified-ads-backend',
    };
  }
} 