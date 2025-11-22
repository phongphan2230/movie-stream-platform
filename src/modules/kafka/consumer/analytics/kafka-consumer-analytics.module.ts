import { Module } from '@nestjs/common';
import { AnalyticsConsumerService } from './kafka-consumer-analytics.service';

/**
 * Analytics Consumer Module
 * Handles analytics and tracking events
 */
@Module({
  providers: [AnalyticsConsumerService],
  exports: [AnalyticsConsumerService],
})
export class AnalyticsConsumerModule {}
