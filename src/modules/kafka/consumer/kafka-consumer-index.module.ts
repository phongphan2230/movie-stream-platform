import { Module, Global } from '@nestjs/common';
import { MovieConsumerModule } from './movie/kafka-consumer-movie.module';
import { AnalyticsConsumerModule } from './analytics/kafka-consumer-analytics.module';

/**
 * Kafka Consumer Index Module
 * Aggregates all consumer modules
 */
@Global()
@Module({
  imports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    // Add more consumer modules here as needed
  ],
  exports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
  ],
})
export class KafkaConsumerIndexModule {}
