import { Module, Global } from '@nestjs/common';
import { KafkaProducerService } from './kafka-producer.service';

@Global()
@Module({
  imports: [],
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaProducerModule {}
