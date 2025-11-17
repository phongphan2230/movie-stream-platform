import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleDestroy, OnModuleInit {
    private consumer: Consumer;
    private kafka: Kafka;

    constructor(
        private readonly clientId: string = "default-consumer",
        private readonly brokers: string[] = ["localhost:9092"],
        private readonly groupId: string = "default-group",
        private readonly topic: string = "default-movies"

    ){{
       this.kafka = new Kafka({
        clientId: this.clientId,
        brokers: this.brokers,
    });

    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    }}

    async onModuleInit(){
        await this.consumer.connect();
        await this.consumer.subscribe({ topic: this.topic });
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log(
                    `Received message: ${message.value} from topic: ${topic}, partition: ${partition}`
                );
            },
        });
        console.log(`✅ Kafka Consumer connected to topic: ${this.topic}`);
    }
    
    async onModuleDestroy() {
        await this.consumer.disconnect();
        console.log(`Kafka consumer "${this.clientId}" disconnected`);
    }
}