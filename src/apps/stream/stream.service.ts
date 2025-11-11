import { Inject, Injectable } from '@nestjs/common';
import type { Producer } from 'kafkajs';

@Injectable()
export class StreamService {
  constructor(@Inject('KAFKA_PRODUCER') private producer: Producer) {}

  async sendViewEvent(userId: string, movieId: string) {
    await this.producer.send({
      topic: 'movie-views',
      messages: [
        { value: JSON.stringify({ userId, movieId, timestamp: Date.now() }) },
      ],
    });
  }
}
