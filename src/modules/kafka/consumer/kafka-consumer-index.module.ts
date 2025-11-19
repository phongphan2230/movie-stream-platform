import { Module, Global, DynamicModule } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer-index.service';
import { MovieConsumerModule } from './movie/kafka-consumer-movie.module';

@Global()
@Module({})
export class KafkaConsumerIndexModule {
  static register(): DynamicModule {
    return {
      module: KafkaConsumerIndexModule,
      providers: [
        {
          provide: 'KAFKA_CONSUMER_OPTIONS',
          useValue: {
            clientId: 'default-client',
            groupId: 'default-group',
            brokers: ['localhost:9092'],
            topic: 'default-topic'
          }
        },
        KafkaConsumerService
      ],
      exports: [KafkaConsumerService],
    };
  }
}
