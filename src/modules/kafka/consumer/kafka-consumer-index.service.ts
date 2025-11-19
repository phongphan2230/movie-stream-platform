import { Injectable, OnModuleInit, OnModuleDestroy, Inject } from "@nestjs/common";
import { Kafka, Consumer, ConsumerSubscribeTopics, EachMessagePayload } from "kafkajs";

export interface KafkaConsumerServiceOptions {
    clientId: string;
    groupId: string;
    brokers: string[];
    topic: string;
}

export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
    private kafka: Kafka;
    private consumer: Consumer;
    private topic: string;

    constructor( @Inject('KAFKA_CONSUMER_OPTIONS')private readonly options: KafkaConsumerServiceOptions) {
        this.kafka = new Kafka({
            clientId: this.options.clientId,
            brokers: this.options.brokers,
        });

        this.consumer = this.kafka.consumer({ groupId: this.options.groupId });
        this.topic = this.options.topic;
    }

    async onModuleInit() {
        await this.connect();
    }

    async onModuleDestroy() {
        await this.disconnect();
    }

    async connect() {
        try {
            await this.consumer.connect();
            console.log(`Kafka consumer ${this.options.clientId} connected`);
        } catch (error) {
            console.error("Error connecting to Kafka:", error);
            throw error;
        }
    }

    async disconnect() {
        try {
            await this.cleanup();
            await this.consumer.disconnect();
            console.log(`Kafka consumer ${this.options.clientId} disconnected`);
        } catch (error) {
            console.error("Error disconnecting from Kafka:", error);
            throw error;
        }
    }

    async cleanup(): Promise<void> {
        try {
            await this.consumer.stop();
            this.consumer.seek({ topic: this.topic, partition: 0, offset: "0" });
            this.consumer.pause([{ topic: this.topic }]);
            console.log(`Kafka consumer ${this.options.clientId} cleaned up`);
        } catch (error) {
            console.error("Error during Kafka consumer cleanup:", error);
            throw error;
        }
    }

    async unsubscribe(): Promise<void> {
        try {
            this.consumer.pause([{ topic: this.topic }]);
            console.log(`Unsubscribed from topic: ${this.topic}`);
        } catch (error) {
            console.error("Error unsubscribing from topic:", error);
            throw error;
        }
    }

    async subscribe(callback: (message: EachMessagePayload) => Promise<void>) {
        await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

        await this.consumer.run({
            eachMessage: async (payload) => {
                try {
                    await callback(payload);
                } catch (error) {
                    console.error("Error processing message:", error);
                }
            },
        });
    }
}
