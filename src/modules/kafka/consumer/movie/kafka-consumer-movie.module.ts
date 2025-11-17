import { Module, Global, DynamicModule } from '@nestjs/common';
import { MovieConsumerService } from './kafka-consumer-movie.service';
import { KafkaConsumerService, KafkaConsumerServiceOptions } from '../kafka-consumer-index.service';

@Global()
@Module({})
export class MovieConsumerModule {
  static register(): DynamicModule {
    const options: KafkaConsumerServiceOptions = {
      clientId: 'movie-view-consumer',
      groupId: 'movie-view-group',
      brokers: ['localhost:9092'],
      topic: 'movie-views',
    };

    return {
      module: MovieConsumerModule,
      providers: [
        {
          provide: 'KAFKA_OPTIONS',
          useValue: options,
        },
        {
          provide: KafkaConsumerService,
          useFactory: (opts: KafkaConsumerServiceOptions) => 
            new KafkaConsumerService(opts),
          inject: ['KAFKA_OPTIONS'],
        },
        MovieConsumerService,
      ],
      exports: [KafkaConsumerService],
    };
  }
}
