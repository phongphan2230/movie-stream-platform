import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const kafkaBrokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
    const validBrokers = kafkaBrokers.filter((broker): broker is string => Boolean(broker));

    app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
            client: {
                clientId: process.env.KAFKA_CLIENT_ID || 'my-nest-app',
                brokers: validBrokers,
            },
            consumer: {
                groupId: process.env.KAFKA_GROUP_ID || 'my-consumer-group',
            },
        },
    });

    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3000);

    console.log(
        `🚀 HTTP server running on http://localhost:${process.env.PORT ?? 3000}`,
    );
    console.log(`📡 Kafka microservice connected`);
}

bootstrap();
