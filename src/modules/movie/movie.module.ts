import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { MovieConsumerModule } from '../kafka/consumer/movie/kafka-consumer-movie.module';
import { KafkaConsumerIndexModule } from '../kafka/consumer/kafka-consumer-index.module';

@Module({
  imports: [
    // KafkaConsumerIndexModule,
    MovieConsumerModule.register(),
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}