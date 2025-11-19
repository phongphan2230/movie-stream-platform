import { Module, Global, DynamicModule } from "@nestjs/common";
import { MovieConsumer } from './kafka-consumer-movie.service';
import { KafkaConsumerService, KafkaConsumerServiceOptions } from "../kafka-consumer-index.service";
import { MovieService } from "src/modules/movie/movie.service";
import { KafkaConsumerIndexModule } from "../kafka-consumer-index.module";
import { MovieController } from "src/modules/movie/movie.controller";

@Global()
@Module({
    imports: [],
  controllers: [MovieController],
  providers: [MovieService, MovieConsumer],
  exports: [MovieService],
})
export class MovieConsumerModule {
    static register(): DynamicModule {
        const options: KafkaConsumerServiceOptions = {
            clientId: "movie-view-consumer",
            groupId: "movie-group",
            brokers: ["localhost:9092"],
            topic: "movie-events",
        };

        return {
            module: MovieConsumerModule,
            imports: [KafkaConsumerIndexModule],
            providers: [
                {
                    provide: 'MOVIE_CONSUMER_OPTIONS',
                    useValue: options,
                },
                {
                    provide: 'MOVIE_CONSUMER',
                    useFactory: (options: KafkaConsumerServiceOptions) => {
                        return new KafkaConsumerService(options);
                    },
                    inject: ['MOVIE_CONSUMER_OPTIONS'],
                },
                MovieConsumer,
            ],
            exports: ['MOVIE_CONSUMER', MovieConsumer],
        };
    }
}
