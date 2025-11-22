import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieModule } from './modules/movie/movie.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GatewayModule } from './modules/gateway/gateway.module';

// ✅ Import Kafka modules
import { KafkaProducerModule } from './modules/kafka/producer/kafka-producer.module';
import { KafkaConsumerIndexModule } from './modules/kafka/consumer/kafka-consumer-index.module';

/**
 * App Module
 * Root module of the application
 */
@Module({
  imports: [
    // Kafka modules (must be imported at root level)
    KafkaProducerModule,        // ✅ Global producer
    KafkaConsumerIndexModule,   // ✅ All consumers
    
    // Feature modules
    MovieModule,
    AnalyticsModule,
    GatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
