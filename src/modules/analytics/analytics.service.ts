import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, register } from 'prom-client';
import { Kafka } from 'kafkajs';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private viewCounter: Counter;

  constructor() {
    this.viewCounter = new Counter({
      name: 'movie_views_total',
      help: 'Tổng số lượt xem phim',
      labelNames: ['movieId'],
    });
  }

  async onModuleInit() {
    const kafka = new Kafka({ brokers: ['localhost:9092'] });
    const consumer = kafka.consumer({ groupId: 'analytics-group' });
    await consumer.connect();
    await consumer.subscribe({ topic: 'movie-views' });

    await consumer.run({
      // eslint-disable-next-line @typescript-eslint/require-await
      eachMessage: async ({ message }) => {
        try {
          if (!message.value) {
            console.warn('Received message with null value');
            return;
          }

          const messageData = JSON.parse(message.value.toString()) as {
            movieId: string;
          };

          if (messageData.movieId) {
            this.viewCounter.inc({ movieId: messageData.movieId });
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });
  }

  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
