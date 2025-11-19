// src/modules/kafka/consumer/movie/movie.consumer.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaConsumerService } from '../kafka-consumer-index.service';

@Injectable()
export class MovieConsumer implements OnModuleInit {
  constructor(
    @Inject('MOVIE_CONSUMER')
    private readonly kafkaConsumer: KafkaConsumerService
  ) {}

  async onModuleInit() {
    await this.kafkaConsumer.subscribe(async (payload) => {
      const { topic, partition, message } = payload;
      const value = message.value?.toString();

      // Process the movie event here
      if (value) {
        try {
          const eventData = JSON.parse(value);
          await this.processMovieEvent(eventData);
        } catch (error) {
          console.error('Error parsing movie event:', error);
        }
      }
    });
  }

  private async processMovieEvent(event: any) {
    console.log('Processing movie event:', event);
    // Add your movie processing logic here
  }
}