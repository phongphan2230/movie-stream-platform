import { Module } from '@nestjs/common';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { KafkaConsumerIndexModule } from '../kafka/consumer/kafka-consumer-index.module';

@Module({
  imports: [
    KafkaConsumerIndexModule.register(),
  ],
  controllers: [MovieController],
  providers: [MovieService],
  exports: [MovieService],
})
export class MovieModule {}
