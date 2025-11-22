import { Injectable } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { BaseKafkaConsumerService } from '../base/kafka-consumer-base.service';
import { KAFKA_CONFIG } from '../../config/kafka.config';

/**
 * Analytics Event Interface
 */
interface AnalyticsEvent {
  eventType: 'PAGE_VIEW' | 'USER_ACTION' | 'MOVIE_VIEW' | 'SEARCH';
  userId?: string;
  sessionId: string;
  timestamp: number;
  data: Record<string, any>;
}

/**
 * Analytics Consumer Service
 * Handles analytics and tracking events
 */
@Injectable()
export class AnalyticsConsumerService extends BaseKafkaConsumerService {
  constructor() {
    super(KAFKA_CONFIG.consumers.analytics, 'AnalyticsConsumer');
  }

  /**
   * Process analytics events
   */
  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition } = payload;
    
    this.logger.log(`📊 Received analytics event from topic: ${topic}, partition: ${partition}`);

    const event = this.parseMessage<AnalyticsEvent>(payload);
    if (!event) {
      this.logger.warn('⚠️ Invalid analytics event format');
      return;
    }

    // Process based on event type
    switch (event.eventType) {
      case 'PAGE_VIEW':
        await this.trackPageView(event);
        break;
      case 'USER_ACTION':
        await this.trackUserAction(event);
        break;
      case 'MOVIE_VIEW':
        await this.trackMovieView(event);
        break;
      case 'SEARCH':
        await this.trackSearch(event);
        break;
      default:
        this.logger.warn(`⚠️ Unknown analytics event type: ${event.eventType}`);
    }
  }

  /**
   * Track page views
   */
  private async trackPageView(event: AnalyticsEvent): Promise<void> {
    this.logger.log(`📄 Tracking page view: ${JSON.stringify(event.data)}`);
    
    // TODO: Store in analytics database
    // await this.analyticsRepository.savePageView(event);
  }

  /**
   * Track user actions
   */
  private async trackUserAction(event: AnalyticsEvent): Promise<void> {
    this.logger.log(`🎯 Tracking user action: ${JSON.stringify(event.data)}`);
    
    // TODO: Store user action for behavior analysis
    // await this.analyticsRepository.saveUserAction(event);
  }

  /**
   * Track movie views for analytics
   */
  private async trackMovieView(event: AnalyticsEvent): Promise<void> {
    this.logger.log(`🎬 Tracking movie view analytics: ${JSON.stringify(event.data)}`);
    
    // TODO: Update analytics metrics
    // await this.analyticsRepository.updateMovieMetrics(event);
  }

  /**
   * Track search queries
   */
  private async trackSearch(event: AnalyticsEvent): Promise<void> {
    this.logger.log(`🔍 Tracking search: ${JSON.stringify(event.data)}`);
    
    // TODO: Store search analytics
    // await this.analyticsRepository.saveSearchQuery(event);
  }

  /**
   * Custom error handler
   */
  protected async handleError(error: Error): Promise<void> {
    this.logger.error('❌ Analytics Consumer Error:', error);
    // Analytics errors shouldn't break the system
    // Just log and continue
  }
}
