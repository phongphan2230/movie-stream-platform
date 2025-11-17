import { Injectable } from '@nestjs/common';
import { KafkaConsumerService } from '../kafka/consumer/kafka-consumer-index.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly KafkaConsumerService: KafkaConsumerService
  ) {}
  getHello(): string {
    return 'Hello World!';
  }
}
