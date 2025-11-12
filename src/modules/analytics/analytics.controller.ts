import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('metrics')
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get()
  getMetrics() {
    return this.analytics.getMetrics();
  }
}
