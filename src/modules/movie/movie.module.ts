import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';

/**
 * Movie Module
 * Note: Consumers are imported at App Module level via KafkaConsumerIndexModule
 * This module only needs to use KafkaProducerService (which is @Global)
 */
@Module({
  imports: [],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}