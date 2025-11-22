import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KAFKA_CONFIG } from '../config/kafka.config';

/**
 * Kafka Producer Service (Singleton)
 * Single producer instance for the entire application
 */
@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private static instance: KafkaProducerService;
  private producer: Producer;
  private kafka: Kafka;

  constructor() {
    // Singleton pattern - ensure only one producer instance
    if (KafkaProducerService.instance) {
      return KafkaProducerService.instance;
    }

    this.kafka = new Kafka(KAFKA_CONFIG.producer);
    KafkaProducerService.instance = this;
  }

  async onModuleInit() {
    this.producer = this.kafka.producer();

    // Event listeners
    this.producer.on(this.producer.events.DISCONNECT, () => {
      console.warn('⚠️ Kafka Producer disconnected!');
    });

    this.producer.on(this.producer.events.REQUEST_TIMEOUT, () => {
      console.warn('⚠️ Kafka Producer request timeout');
    });

    this.producer.on(this.producer.events.CONNECT, () => {
      console.log('✅ Kafka Producer connected');
    });

    try {
      await this.producer.connect();
    } catch (err) {
      console.error('❌ Failed to connect Kafka Producer:', err);
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }

  /**
   * Send a message to a specific topic
   * @param topic - Kafka topic name
   * @param message - Message payload (will be JSON stringified)
   * @param key - Optional message key for partitioning
   */
  async sendMessage(topic: string, message: any, key?: string) {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: JSON.stringify(message),
            timestamp: Date.now().toString(),
          },
        ],
      });
      console.log(`📤 Message sent to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to send message to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send movie view event
   * @param userId - User ID
   * @param movieId - Movie ID
   */
  async sendMovieViewEvent(userId: string, movieId: string) {
    await this.sendMessage(
      KAFKA_CONFIG.topics.MOVIE_VIEWS,
      {
        eventType: 'VIEW',
        userId,
        movieId,
        timestamp: Date.now(),
      },
      movieId // Use movieId as key for partitioning
    );
  }

  /**
   * Send movie event (generic)
   * @param eventType - Type of event (VIEW, LIKE, COMMENT, SHARE)
   * @param userId - User ID
   * @param movieId - Movie ID
   * @param metadata - Additional metadata
   */
  async sendMovieEvent(
    eventType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE',
    userId: string,
    movieId: string,
    metadata?: Record<string, any>
  ) {
    await this.sendMessage(
      KAFKA_CONFIG.topics.MOVIE_EVENTS,
      {
        eventType,
        userId,
        movieId,
        timestamp: Date.now(),
        metadata,
      },
      movieId
    );
  }

  /**
   * Send analytics event
   * @param eventType - Type of analytics event
   * @param sessionId - Session ID
   * @param data - Event data
   * @param userId - Optional user ID
   */
  async sendAnalyticsEvent(
    eventType: 'PAGE_VIEW' | 'USER_ACTION' | 'MOVIE_VIEW' | 'SEARCH',
    sessionId: string,
    data: Record<string, any>,
    userId?: string
  ) {
    await this.sendMessage(
      KAFKA_CONFIG.topics.USER_ACTIONS,
      {
        eventType,
        userId,
        sessionId,
        timestamp: Date.now(),
        data,
      },
      sessionId
    );
  }

  /**
   * Send batch messages to a topic
   * @param topic - Kafka topic name
   * @param messages - Array of messages
   */
  async sendBatchMessages(topic: string, messages: any[]) {
    if (!this.producer) {
      throw new Error('Producer not initialized');
    }

    try {
      await this.producer.send({
        topic,
        messages: messages.map((msg) => ({
          value: JSON.stringify(msg),
          timestamp: Date.now().toString(),
        })),
      });
      console.log(`📤 Batch of ${messages.length} messages sent to topic: ${topic}`);
    } catch (error) {
      console.error(`❌ Failed to send batch messages to topic ${topic}:`, error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.cleanUp();
    console.log('🧹 Kafka Producer disconnected');
  }

  async cleanUp() {
    if (this.producer) {
      try {
        await this.producer.disconnect();
      } catch (error) {
        console.error('Failed to disconnect Kafka producer:', error);
      }
    }
  }
}
