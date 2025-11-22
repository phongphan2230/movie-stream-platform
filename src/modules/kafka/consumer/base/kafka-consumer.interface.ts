import { EachMessagePayload } from 'kafkajs';

/**
 * Interface for Kafka Consumer Options
 */
export interface KafkaConsumerOptions {
  clientId: string;
  groupId: string;
  brokers: string[];
  topics: string[];
}

/**
 * Interface that all consumers must implement
 */
export interface IKafkaConsumer {
  /**
   * Process incoming Kafka message
   * @param payload - The Kafka message payload
   */
  handleMessage(payload: EachMessagePayload): Promise<void>;

  /**
   * Optional: Handle consumer errors
   * @param error - The error object
   */
  handleError?(error: Error): Promise<void>;
}
