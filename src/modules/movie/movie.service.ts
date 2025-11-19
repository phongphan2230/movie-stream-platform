import { Inject, Injectable } from '@nestjs/common';
import { KafkaConsumerService } from '../kafka/consumer/kafka-consumer-index.service';

@Injectable()
export class MovieService {
  constructor(
    @Inject('MOVIE_CONSUMER')
    private readonly kafkaConsumerService: KafkaConsumerService  // Đổi tên biến thành dạng camelCase
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}