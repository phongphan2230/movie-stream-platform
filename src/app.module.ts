import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MovieController } from './modules/movie/movie.controller';
import { MovieModule } from './modules/movie/movie.module';
import { AnalyticsController } from './modules/analytics/analytics.controller';
import { GatewayController } from './modules/gateway/gateway.controller';
import { StreamController } from './modules/stream/stream.controller';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { GatewayModule } from './modules/gateway/gateway.module';

@Module({
  imports: [MovieModule, AnalyticsModule,GatewayModule],
  controllers: [AppController, MovieController, AnalyticsController, GatewayController],
  providers: [AppService],
})
export class AppModule {}
