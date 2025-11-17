import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KafkaProducerService } from '../kafka/producer/kafka-producer.service';

@Injectable()
export class StreamService {
  constructor(private readonly producerService: KafkaProducerService){}
  getHello(): string {
    return 'Hello World!';
  }
}
