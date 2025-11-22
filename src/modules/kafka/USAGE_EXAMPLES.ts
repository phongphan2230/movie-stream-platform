/**
 * EXAMPLE: How to use Kafka Producer in your services
 * 
 * This file demonstrates various ways to send events using KafkaProducerService
 */

import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/producer/kafka-producer.service';

@Injectable()
export class MovieService {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  /**
   * Example 1: Track movie view
   */
  async watchMovie(userId: string, movieId: string) {
    // Your business logic here
    // ...

    // Send Kafka event
    await this.kafkaProducer.sendMovieViewEvent(userId, movieId);
  }

  /**
   * Example 2: Track movie like
   */
  async likeMovie(userId: string, movieId: string) {
    // Your business logic here
    // ...

    // Send Kafka event with metadata
    await this.kafkaProducer.sendMovieEvent('LIKE', userId, movieId, {
      source: 'web',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Example 3: Track movie comment
   */
  async commentOnMovie(userId: string, movieId: string, comment: string) {
    // Your business logic here
    // ...

    // Send Kafka event with comment data
    await this.kafkaProducer.sendMovieEvent('COMMENT', userId, movieId, {
      comment,
      length: comment.length,
    });
  }

  /**
   * Example 4: Track movie share
   */
  async shareMovie(userId: string, movieId: string, platform: string) {
    // Your business logic here
    // ...

    await this.kafkaProducer.sendMovieEvent('SHARE', userId, movieId, {
      platform, // 'facebook', 'twitter', etc.
    });
  }

  /**
   * Example 5: Send custom analytics event
   */
  async trackPageView(sessionId: string, page: string, userId?: string) {
    await this.kafkaProducer.sendAnalyticsEvent(
      'PAGE_VIEW',
      sessionId,
      {
        page,
        referrer: 'google.com',
        userAgent: 'Mozilla/5.0...',
      },
      userId
    );
  }

  /**
   * Example 6: Send search analytics
   */
  async trackSearch(sessionId: string, query: string, results: number, userId?: string) {
    await this.kafkaProducer.sendAnalyticsEvent(
      'SEARCH',
      sessionId,
      {
        query,
        resultsCount: results,
        timestamp: Date.now(),
      },
      userId
    );
  }

  /**
   * Example 7: Send batch events (for bulk operations)
   */
  async trackBulkViews(views: Array<{ userId: string; movieId: string }>) {
    const events = views.map(({ userId, movieId }) => ({
      eventType: 'VIEW',
      userId,
      movieId,
      timestamp: Date.now(),
    }));

    await this.kafkaProducer.sendBatchMessages('movie-views', events);
  }

  /**
   * Example 8: Send custom message to custom topic
   */
  async sendCustomEvent(topic: string, data: any) {
    await this.kafkaProducer.sendMessage(topic, data, 'optional-key');
  }
}

/**
 * EXAMPLE: How consumers automatically process these events
 * 
 * You don't need to call consumers manually - they auto-start when app starts
 * and listen to their configured topics.
 * 
 * See: kafka-consumer-movie.service.ts for implementation
 */

// ============================================
// EXAMPLE: Adding a new consumer
// ============================================

/**
 * Step 1: Create consumer service
 */
/*
import { Injectable } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { BaseKafkaConsumerService } from '../base/kafka-consumer-base.service';
import { KAFKA_CONFIG } from '../../config/kafka.config';

@Injectable()
export class NotificationConsumerService extends BaseKafkaConsumerService {
  constructor() {
    super(KAFKA_CONFIG.consumers.notification, 'NotificationConsumer');
  }

  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const event = this.parseMessage(payload);
    
    if (event.type === 'EMAIL') {
      await this.sendEmail(event);
    } else if (event.type === 'PUSH') {
      await this.sendPushNotification(event);
    }
  }

  private async sendEmail(event: any) {
    // Email sending logic
  }

  private async sendPushNotification(event: any) {
    // Push notification logic
  }
}
*/

/**
 * Step 2: Create consumer module
 */
/*
import { Module } from '@nestjs/common';
import { NotificationConsumerService } from './kafka-consumer-notification.service';

@Module({
  providers: [NotificationConsumerService],
  exports: [NotificationConsumerService],
})
export class NotificationConsumerModule {}
*/

/**
 * Step 3: Add config to kafka.config.ts
 */
/*
export const KAFKA_CONFIG = {
  // ...
  consumers: {
    // ... existing consumers
    notification: {
      clientId: 'notification-consumer',
      groupId: 'notification-group',
      brokers: ['localhost:9092'],
      topics: ['notification-events'],
    },
  },
};
*/

/**
 * Step 4: Import in kafka-consumer-index.module.ts
 */
/*
@Module({
  imports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // Add here
  ],
  exports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // Add here
  ],
})
export class KafkaConsumerIndexModule {}
*/
