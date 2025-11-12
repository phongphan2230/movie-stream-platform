import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { Kafka } from 'kafkajs';

@Module({
  providers: [
    StreamService,
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async () => {
        const kafka = new Kafka({ brokers: ['localhost:9092'] });
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
    },
  ],
  exports: ['KAFKA_PRODUCER'],
})
export class StreamModule {}
