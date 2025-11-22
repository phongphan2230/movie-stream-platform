# Kafka Architecture - Movie Stream Platform

## 📋 Tổng Quan

Kiến trúc Kafka của dự án được thiết kế theo mô hình **1 Producer - Nhiều Consumers** với các best practices:

- ✅ **Single Producer Instance** (Singleton pattern)
- ✅ **Multiple Independent Consumers** (Mỗi consumer xử lý domain riêng)
- ✅ **Base Consumer Class** (Tái sử dụng code, dễ mở rộng)
- ✅ **Centralized Configuration** (Quản lý config tập trung)
- ✅ **Type-Safe Events** (TypeScript interfaces cho events)

---

## 🏗️ Cấu Trúc Thư Mục

```
src/modules/kafka/
├── config/
│   └── kafka.config.ts              # ⚙️ Centralized config cho producer & consumers
├── producer/
│   ├── kafka-producer.module.ts     # 📤 Producer module (Global)
│   └── kafka-producer.service.ts    # 📤 Producer service (Singleton)
└── consumer/
    ├── base/
    │   ├── kafka-consumer.interface.ts      # 📝 Consumer interface
    │   └── kafka-consumer-base.service.ts   # 🎯 Base consumer class
    ├── movie/
    │   ├── kafka-consumer-movie.module.ts
    │   └── kafka-consumer-movie.service.ts  # 🎬 Movie events consumer
    ├── analytics/
    │   ├── kafka-consumer-analytics.module.ts
    │   └── kafka-consumer-analytics.service.ts  # 📊 Analytics consumer
    ├── kafka-consumer-index.module.ts       # 📦 Aggregate all consumers
    └── kafka-consumer-index.service.ts      # ⚠️ DEPRECATED - Không dùng nữa
```

---

## 🚀 Cách Sử Dụng

### 1️⃣ **Import vào App Module**

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { KafkaProducerModule } from './modules/kafka/producer/kafka-producer.module';
import { KafkaConsumerIndexModule } from './modules/kafka/consumer/kafka-consumer-index.module';

@Module({
  imports: [
    KafkaProducerModule,      // Producer (Global)
    KafkaConsumerIndexModule, // All Consumers
    // ... other modules
  ],
})
export class AppModule {}
```

### 2️⃣ **Sử Dụng Producer để Gửi Events**

```typescript
// movie.service.ts
import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from '../kafka/producer/kafka-producer.service';

@Injectable()
export class MovieService {
  constructor(private readonly kafkaProducer: KafkaProducerService) {}

  async trackMovieView(userId: string, movieId: string) {
    // Cách 1: Sử dụng method có sẵn
    await this.kafkaProducer.sendMovieViewEvent(userId, movieId);

    // Cách 2: Sử dụng method generic
    await this.kafkaProducer.sendMovieEvent('VIEW', userId, movieId, {
      source: 'web',
      duration: 120,
    });

    // Cách 3: Gửi custom message
    await this.kafkaProducer.sendMessage('custom-topic', {
      customField: 'value',
    });
  }

  async trackMovieLike(userId: string, movieId: string) {
    await this.kafkaProducer.sendMovieEvent('LIKE', userId, movieId);
  }
}
```

### 3️⃣ **Consumer Tự Động Xử Lý Events**

Consumers sẽ tự động khởi động khi app start và lắng nghe events:

```typescript
// kafka-consumer-movie.service.ts
@Injectable()
export class MovieConsumerService extends BaseKafkaConsumerService {
  constructor() {
    super(KAFKA_CONFIG.consumers.movie, 'MovieConsumer');
  }

  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const event = this.parseMessage<MovieEvent>(payload);
    
    // Xử lý event dựa trên type
    switch (event.eventType) {
      case 'VIEW':
        await this.handleViewEvent(event);
        break;
      case 'LIKE':
        await this.handleLikeEvent(event);
        break;
      // ...
    }
  }

  private async handleViewEvent(event: MovieEvent): Promise<void> {
    // Business logic của bạn ở đây
    // Ví dụ: Cập nhật view count, analytics, etc.
  }
}
```

---

## ➕ Thêm Consumer Mới

### Bước 1: Tạo Consumer Service

```typescript
// notification/kafka-consumer-notification.service.ts
import { Injectable } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { BaseKafkaConsumerService } from '../base/kafka-consumer-base.service';
import { KAFKA_CONFIG } from '../../config/kafka.config';

@Injectable()
export class NotificationConsumerService extends BaseKafkaConsumerService {
  constructor() {
    super(KAFKA_CONFIG.consumers.notification, 'NotificationConsumer');
  }

  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const event = this.parseMessage(payload);
    // Xử lý notification logic
  }
}
```

### Bước 2: Tạo Consumer Module

```typescript
// notification/kafka-consumer-notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationConsumerService } from './kafka-consumer-notification.service';

@Module({
  providers: [NotificationConsumerService],
  exports: [NotificationConsumerService],
})
export class NotificationConsumerModule {}
```

### Bước 3: Thêm Config

```typescript
// config/kafka.config.ts
export const KAFKA_CONFIG = {
  // ...
  consumers: {
    // ... existing consumers
    notification: {
      clientId: 'notification-consumer',
      groupId: 'notification-group',
      brokers: ['localhost:9092'],
      topics: ['notification-events'],
    },
  },
  topics: {
    // ... existing topics
    NOTIFICATION_EVENTS: 'notification-events',
  },
};
```

### Bước 4: Register vào Index Module

```typescript
// kafka-consumer-index.module.ts
@Module({
  imports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // ✅ Thêm vào đây
  ],
  exports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // ✅ Thêm vào đây
  ],
})
export class KafkaConsumerIndexModule {}
```

---

## 🎯 Topics & Events

### Movie Events (`movie-events`)
```typescript
{
  eventType: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE',
  userId: string,
  movieId: string,
  timestamp: number,
  metadata?: Record<string, any>
}
```

### Movie Views (`movie-views`)
```typescript
{
  eventType: 'VIEW',
  userId: string,
  movieId: string,
  timestamp: number
}
```

### Analytics Events (`user-actions`)
```typescript
{
  eventType: 'PAGE_VIEW' | 'USER_ACTION' | 'MOVIE_VIEW' | 'SEARCH',
  userId?: string,
  sessionId: string,
  timestamp: number,
  data: Record<string, any>
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# .env
KAFKA_CLIENT_ID=movie-stream-producer
KAFKA_BROKERS=localhost:9092,localhost:9093
```

### Kafka Config

Tất cả config được quản lý tập trung tại `config/kafka.config.ts`:

```typescript
export const KAFKA_CONFIG = {
  producer: {
    clientId: process.env.KAFKA_CLIENT_ID || 'movie-stream-producer',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    // ...
  },
  consumers: {
    movie: { /* ... */ },
    analytics: { /* ... */ },
  },
  topics: {
    MOVIE_EVENTS: 'movie-events',
    // ...
  },
};
```

---

## 🔍 Monitoring & Debugging

### Logs

Mỗi consumer có logger riêng với context name:

```
✅ Kafka consumer connected: movie-consumer
📡 Subscribed to topic: movie-events
📨 Received message from topic: movie-events, partition: 0
👁️ Processing VIEW event for movie: 123 by user: 456
```

### Error Handling

- **Producer**: Auto-retry connection sau 5s nếu fail
- **Consumer**: Log error và continue processing (không crash app)
- **Message Parsing**: Validate và skip invalid messages

---

## ✅ Best Practices Được Áp Dụng

1. ✅ **Singleton Producer** - Chỉ 1 instance producer cho toàn app
2. ✅ **Independent Consumers** - Mỗi consumer xử lý domain riêng
3. ✅ **Base Class Pattern** - Tái sử dụng code, dễ maintain
4. ✅ **Centralized Config** - Quản lý config ở 1 nơi
5. ✅ **Type Safety** - TypeScript interfaces cho events
6. ✅ **Error Handling** - Graceful error handling, không crash app
7. ✅ **Logging** - Chi tiết logs cho debugging
8. ✅ **Scalability** - Dễ dàng thêm consumer mới
9. ✅ **Separation of Concerns** - Producer/Consumer tách biệt
10. ✅ **Message Key Partitioning** - Sử dụng movieId làm key để partition

---

## 🚨 Migration từ Code Cũ

### Files Cần Xóa (DEPRECATED)

- ❌ `consumer/kafka-consumer-index.service.ts` - Không dùng nữa, thay bằng base class

### Files Cần Giữ Nhưng Đã Refactor

- ✅ `consumer/movie/kafka-consumer-movie.service.ts` - Đã refactor
- ✅ `consumer/movie/kafka-consumer-movie.module.ts` - Đã đơn giản hóa
- ✅ `producer/kafka-producer.service.ts` - Đã enhance

---

## 📚 Tài Liệu Tham Khảo

- [KafkaJS Documentation](https://kafka.js.org/)
- [NestJS Microservices](https://docs.nestjs.com/microservices/basics)
- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)

---

## 💡 Tips

1. **Development**: Sử dụng `fromBeginning: true` để test với old messages
2. **Production**: Sử dụng `fromBeginning: false` để chỉ process new messages
3. **Partitioning**: Sử dụng movieId/userId làm key để ensure order
4. **Consumer Groups**: Mỗi consumer có groupId riêng để scale horizontal
5. **Error Handling**: Implement dead letter queue cho failed messages

---

**Tác giả**: Antigravity AI  
**Ngày cập nhật**: 2025-11-22
