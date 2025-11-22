import { Module } from '@nestjs/common';
import { MovieConsumerService } from './kafka-consumer-movie.service';

/**
 * Movie Consumer Module
 * Handles movie-related Kafka events
 */
@Module({
  providers: [MovieConsumerService],
  exports: [MovieConsumerService],
})
export class MovieConsumerModule {}
