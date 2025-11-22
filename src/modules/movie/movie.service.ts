import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/producer/kafka-producer.service';

/**
 * Movie Service
 * Handles movie-related business logic and sends Kafka events
 */
@Injectable()
export class MovieService {
  constructor(
    private readonly kafkaProducer: KafkaProducerService  // ✅ Inject Producer, NOT Consumer
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Track when a user views a movie
   */
  async trackMovieView(userId: string, movieId: string): Promise<void> {
    // Your business logic here (e.g., save to database)
    // ...

    // Send Kafka event
    await this.kafkaProducer.sendMovieViewEvent(userId, movieId);
  }

  /**
   * Track when a user likes a movie
   */
  async likeMovie(userId: string, movieId: string): Promise<void> {
    // Your business logic here
    // ...

    // Send Kafka event
    await this.kafkaProducer.sendMovieEvent('LIKE', userId, movieId, {
      source: 'web',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track when a user comments on a movie
   */
  async commentOnMovie(userId: string, movieId: string, comment: string): Promise<void> {
    // Your business logic here
    // ...

    // Send Kafka event
    await this.kafkaProducer.sendMovieEvent('COMMENT', userId, movieId, {
      comment,
      commentLength: comment.length,
    });
  }

  /**
   * Track when a user shares a movie
   */
  async shareMovie(userId: string, movieId: string, platform: string): Promise<void> {
    // Your business logic here
    // ...

    // Send Kafka event
    await this.kafkaProducer.sendMovieEvent('SHARE', userId, movieId, {
      platform, // 'facebook', 'twitter', etc.
    });
  }
}