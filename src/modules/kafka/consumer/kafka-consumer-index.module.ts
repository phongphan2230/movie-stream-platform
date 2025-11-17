import { Module, Global, DynamicModule } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer-index.service';
import { MovieConsumerModule } from './movie/kafka-consumer-movie.module';

@Global()
@Module({})
export class KafkaConsumerIndexModule {
  static register(): DynamicModule {
    return {
      module: KafkaConsumerIndexModule,
      imports: [MovieConsumerModule.register()],
      providers: [
        KafkaConsumerService, 
      ],
      exports: [
        KafkaConsumerService,
        MovieConsumerModule.register(), 
      ],
    };
  }
}
