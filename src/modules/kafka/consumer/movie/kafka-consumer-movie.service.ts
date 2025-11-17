import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaConsumerService } from '../kafka-consumer-index.service';

@Injectable()
export class MovieConsumerService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly consumer: KafkaConsumerService) {}

  async onModuleInit() {
    await this.consumer.subscribe(async ({ message }) => {
      const value = message.value?.toString();
      console.log('🎬 Movie view event received:', value);
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
