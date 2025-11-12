import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { producerService } from './main';

@Injectable()
export class StreamService {
  constructor(private readonly producerService: producerService){}
  getHello(): string {
    return 'Hello World!';
  }
}
