import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, register } from 'prom-client';
import { Consumer } from 'kafkajs';
import * as client from 'prom-client';
import { producerService } from '../producer/producer.service';

@Injectable()
export class AnalyticsService implements OnModuleInit {
  private requestCouter: client.Counter<string>
  private responseTimeHistogram: client.Histogram<string>

  private consumer: Consumer;

  constructor(private readonly kafkaService: producerService) {
    client.collectDefaultMetrics();
    this.requestCouter = new client.Counter({
      name: 'http_requests_total',
      help: 'Tổng số lượt xem phim',
      labelNames: ['method', 'path'],
    });
    this.responseTimeHistogram = new client.Histogram({
      name: 'http_response_time_seconds',
      help: 'Thời gian phản hồi HTTP',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });
  }

  async onModuleInit() {
    this.consumer = this.kafkaService.createConsumer('analytics-group');
    
    this.consumer.on(this.consumer.events.CRASH, ({ payload: { error } }) => {
      console.error('Kafka consumer crashed:', error);
      setTimeout(() => this.onModuleInit(), 5000);
    });

    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic: 'movie-views', fromBeginning: true });

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          try {
            if (!message.value) {
              console.warn('Received message with null value');
              return;
            }

            const messageData = JSON.parse(message.value.toString()) as {
              movieId: string;
              userId: string;
              timestamp: number;
            };

            if (messageData.movieId) {
              this.requestCouter.inc({ method: 'GET', path: '/movie-views' });
              this.responseTimeHistogram.observe({ method: 'GET', path: '/movie-views' }, 0.1);
            }
          } catch (error) {
            console.error('Error processing message:', error);
          }
        },
      });
    } catch (error) {
      console.error('Failed to start consumer:', error);
      setTimeout(() => this.onModuleInit(), 5000);
    }
  }
  incrementRequest(method: string, route: string, status: string) {
    this.requestCouter.inc({ method, route, status });
  }

  // Ghi response time
  observeResponseTime(method: string, route: string, status: string, seconds: number) {
    this.responseTimeHistogram.observe({ method, route, status }, seconds);
  }
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
