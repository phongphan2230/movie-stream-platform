import { Injectable } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { BaseKafkaConsumerService } from '../base/kafka-consumer-base.service';
import { KAFKA_CONFIG } from '../../config/kafka.config';

/**
 * Movie Event Interface
 */
interface MovieEvent {
  eventType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE';
  userId: string;
  movieId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Movie Consumer Service
 * Handles all movie-related Kafka events
 */
@Injectable()
export class MovieConsumerService extends BaseKafkaConsumerService {
  constructor() {
    // Pass config from centralized config
    super(KAFKA_CONFIG.consumers.movie, 'MovieConsumer');
  }

  /**
   * Process movie events
   */
  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    
    this.logger.log(`📨 Received message from topic: ${topic}, partition: ${partition}`);

    // Parse the message
    const event = this.parseMessage<MovieEvent>(payload);
    if (!event) {
      this.logger.warn('⚠️ Invalid message format');
      return;
    }

    // Route to appropriate handler based on event type
    switch (event.eventType) {
      case 'VIEW':
        await this.handleViewEvent(event);
        break;
      case 'LIKE':
        await this.handleLikeEvent(event);
        break;
      case 'COMMENT':
        await this.handleCommentEvent(event);
        break;
      case 'SHARE':
        await this.handleShareEvent(event);
        break;
      default:
        this.logger.warn(`⚠️ Unknown event type: ${event.eventType}`);
    }
  }

  /**
   * Handle movie view events
   */
  private async handleViewEvent(event: MovieEvent): Promise<void> {
    this.logger.log(`👁️ Processing VIEW event for movie: ${event.movieId} by user: ${event.userId}`);
    
    // TODO: Implement your business logic here
    // Example: Update view count in database, analytics, etc.
    // await this.movieService.incrementViewCount(event.movieId);
    // await this.analyticsService.trackView(event);
  }

  /**
   * Handle movie like events
   */
  private async handleLikeEvent(event: MovieEvent): Promise<void> {
    this.logger.log(`❤️ Processing LIKE event for movie: ${event.movieId} by user: ${event.userId}`);
    
    // TODO: Implement your business logic
    // await this.movieService.addLike(event.movieId, event.userId);
  }

  /**
   * Handle movie comment events
   */
  private async handleCommentEvent(event: MovieEvent): Promise<void> {
    this.logger.log(`💬 Processing COMMENT event for movie: ${event.movieId} by user: ${event.userId}`);
    
    // TODO: Implement your business logic
    // await this.commentService.createComment(event);
  }

  /**
   * Handle movie share events
   */
  private async handleShareEvent(event: MovieEvent): Promise<void> {
    this.logger.log(`🔗 Processing SHARE event for movie: ${event.movieId} by user: ${event.userId}`);
    
    // TODO: Implement your business logic
    // await this.movieService.incrementShareCount(event.movieId);
  }

  /**
   * Custom error handler for movie consumer
   */
  protected async handleError(error: Error): Promise<void> {
    this.logger.error('❌ Movie Consumer Error:', error);
    
    // TODO: Add custom error handling
    // Example: Send to error tracking service, dead letter queue, etc.
    // await this.errorTrackingService.logError(error);
  }
}