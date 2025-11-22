import { OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaConsumerOptions, IKafkaConsumer } from './kafka-consumer.interface';

/**
 * Base Kafka Consumer Service
 * All specific consumers should extend this class
 */
export abstract class BaseKafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  protected readonly logger: Logger;
  private kafka: Kafka;
  private consumer: Consumer;
  private readonly options: KafkaConsumerOptions;

  constructor(options: KafkaConsumerOptions, loggerContext: string) {
    this.options = options;
    this.logger = new Logger(loggerContext);

    this.kafka = new Kafka({
      clientId: this.options.clientId,
      brokers: this.options.brokers,
      connectionTimeout: 5000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId: this.options.groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Connect to Kafka and subscribe to topics
   */
  private async connect() {
    try {
      await this.consumer.connect();
      this.logger.log(`✅ Kafka consumer connected: ${this.options.clientId}`);

      // Subscribe to all topics
      for (const topic of this.options.topics) {
        await this.consumer.subscribe({
          topic,
          fromBeginning: false, // Set to true if you want to process old messages
        });
        this.logger.log(`📡 Subscribed to topic: ${topic}`);
      }

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          try {
            await this.handleMessage(payload);
          } catch (error) {
            this.logger.error(`❌ Error processing message from topic ${payload.topic}:`, error);
            await this.handleError(error);
          }
        },
      });
    } catch (error) {
      this.logger.error('❌ Failed to connect Kafka Consumer:', error);
      // Retry connection after 5 seconds
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Disconnect from Kafka
   */
  private async disconnect() {
    try {
      await this.consumer.disconnect();
      this.logger.log(`🧹 Kafka consumer disconnected: ${this.options.clientId}`);
    } catch (error) {
      this.logger.error('❌ Error disconnecting Kafka consumer:', error);
    }
  }

  /**
   * Abstract method - Must be implemented by child classes
   * This is where you process the Kafka message
   */
  protected abstract handleMessage(payload: EachMessagePayload): Promise<void>;

  /**
   * Optional error handler - Can be overridden by child classes
   */
  protected async handleError(error: Error): Promise<void> {
    // Default error handling - can be overridden
    this.logger.error('Consumer error:', error);
  }

  /**
   * Helper method to parse message value
   */
  protected parseMessage<T>(payload: EachMessagePayload): T | null {
    try {
      const value = payload.message.value?.toString();
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Failed to parse message:', error);
      return null;
    }
  }
}
