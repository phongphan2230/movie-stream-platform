import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class StreamService implements OnModuleInit, OnModuleDestroy {
  private static instance: StreamService;
  private producer: Producer;
  private kafka: Kafka;

  constructor() {
    if (StreamService.instance) {
      return StreamService.instance;
    }
    this.kafka = new Kafka({
      clientId: 'test-producer',
      brokers: ['localhost:9092'],
    });

    StreamService.instance = this;
  }

  async onModuleInit() {
    this.producer = this.kafka.producer();

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


  async sendViewEvent(userId: string, movieId: string) {
    if (!this.producer) throw new Error('Producer not initialized');

    await this.producer.send({
      topic: 'movie-views',
      messages: [
        {
          value: JSON.stringify({
            userId,
            movieId,
            timestamp: Date.now(),
          }),
        },
      ],
    });
  }

  async sendMessage(topic: string, message: any) {
    if (!this.producer) throw new Error('Producer not initialized');

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async onModuleDestroy() {
    await this.cleanUp();
    console.log('🧹 Kafka Producer disconnected');
  }

  async cleanUp() {
    if (this.producer){
      try {
        await this.producer.disconnect();
      } catch (error) {
        console.error('Failed to disconnect Kafka producer:', error);
      }
    }
  }
}
