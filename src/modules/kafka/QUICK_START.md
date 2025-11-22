# ⚡ Quick Start Guide

## 🚀 Bắt Đầu Nhanh (5 Phút)

### Bước 1: Xóa Files Cũ (Optional)

```bash
# Xóa file deprecated
rm src/modules/kafka/consumer/kafka-consumer-index.service.ts

# Xóa folder trống
rmdir src/modules/kafka/consumer/analytic
```

### Bước 2: Cập Nhật App Module

```typescript
// src/app.module.ts
import { KafkaProducerModule } from './modules/kafka/producer/kafka-producer.module';
import { KafkaConsumerIndexModule } from './modules/kafka/consumer/kafka-consumer-index.module';

@Module({
  imports: [
    KafkaProducerModule,        // ✅ Add this
    KafkaConsumerIndexModule,   // ✅ Add this
    // ... other modules
  ],
})
export class AppModule {}
```

### Bước 3: Build & Run

```bash
# Install dependencies (if needed)
npm install

# Build
npm run build

# Run
npm run start:dev
```

### Bước 4: Verify Logs

Bạn sẽ thấy:

```
✅ Kafka Producer connected
✅ Kafka consumer connected: movie-consumer
📡 Subscribed to topic: movie-events
📡 Subscribed to topic: movie-views
✅ Kafka consumer connected: analytics-consumer
📡 Subscribed to topic: movie-views
📡 Subscribed to topic: user-actions
```

### Bước 5: Test

```typescript
// Trong bất kỳ service nào
constructor(private readonly kafkaProducer: KafkaProducerService) {}

async test() {
  await this.kafkaProducer.sendMovieViewEvent('user123', 'movie456');
}
```

---

## 📖 Đọc Thêm

- **README.md** - Full documentation
- **USAGE_EXAMPLES.ts** - Code examples
- **MIGRATION_GUIDE.md** - Migration instructions
- **ARCHITECTURE.md** - Architecture details
- **SUMMARY.md** - Complete overview

---

## 🎯 Sử Dụng Producer

### Cơ Bản

```typescript
// Inject vào service
constructor(private readonly kafkaProducer: KafkaProducerService) {}

// Send movie view event
await this.kafkaProducer.sendMovieViewEvent(userId, movieId);

// Send movie event với metadata
await this.kafkaProducer.sendMovieEvent('LIKE', userId, movieId, {
  source: 'web',
});

// Send analytics event
await this.kafkaProducer.sendAnalyticsEvent('PAGE_VIEW', sessionId, {
  page: '/movies/123',
});

// Send custom message
await this.kafkaProducer.sendMessage('custom-topic', { data: 'value' });
```

---

## ➕ Thêm Consumer Mới

### 1. Tạo Service

```typescript
// consumer/notification/kafka-consumer-notification.service.ts
import { Injectable } from '@nestjs/common';
import { EachMessagePayload } from 'kafkajs';
import { BaseKafkaConsumerService } from '../base/kafka-consumer-base.service';
import { KAFKA_CONFIG } from '../../config/kafka.config';

@Injectable()
export class NotificationConsumerService extends BaseKafkaConsumerService {
  constructor() {
    super(KAFKA_CONFIG.consumers.notification, 'NotificationConsumer');
  }

  protected async handleMessage(payload: EachMessagePayload) {
    const event = this.parseMessage(payload);
    this.logger.log('Processing notification:', event);
    // Your logic here
  }
}
```

### 2. Tạo Module

```typescript
// consumer/notification/kafka-consumer-notification.module.ts
import { Module } from '@nestjs/common';
import { NotificationConsumerService } from './kafka-consumer-notification.service';

@Module({
  providers: [NotificationConsumerService],
  exports: [NotificationConsumerService],
})
export class NotificationConsumerModule {}
```

### 3. Thêm Config

```typescript
// config/kafka.config.ts
export const KAFKA_CONFIG = {
  // ...
  consumers: {
    // ... existing
    notification: {
      clientId: 'notification-consumer',
      groupId: 'notification-group',
      brokers: ['localhost:9092'],
      topics: ['notification-events'],
    },
  },
  topics: {
    // ... existing
    NOTIFICATION_EVENTS: 'notification-events',
  },
};
```

### 4. Import Module

```typescript
// consumer/kafka-consumer-index.module.ts
import { NotificationConsumerModule } from './notification/kafka-consumer-notification.module';

@Module({
  imports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // ✅ Add here
  ],
  exports: [
    MovieConsumerModule,
    AnalyticsConsumerModule,
    NotificationConsumerModule, // ✅ Add here
  ],
})
export class KafkaConsumerIndexModule {}
```

---

## 🔧 Configuration

### Environment Variables

```env
# .env
KAFKA_CLIENT_ID=movie-stream-producer
KAFKA_BROKERS=localhost:9092
```

### Kafka Config

Edit `config/kafka.config.ts` để thay đổi:
- Broker addresses
- Topic names
- Consumer groups
- Connection settings

---

## 🐛 Troubleshooting

### Producer không connect

```bash
# Check Kafka đang chạy
docker ps | grep kafka

# Restart Kafka
docker-compose restart kafka
```

### Consumer không nhận message

1. Check topic name trong config
2. Check consumer logs
3. Test send message từ Kafka CLI

### Build error

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## ✅ Checklist

- [ ] App module đã import `KafkaProducerModule` và `KafkaConsumerIndexModule`
- [ ] `npm run build` thành công
- [ ] `npm run start:dev` thành công
- [ ] Logs hiển thị "Kafka Producer connected"
- [ ] Logs hiển thị "Kafka consumer connected"
- [ ] Test send event thành công

---

## 🎉 Done!

Bạn đã setup xong Kafka architecture!

**Next:** Đọc `README.md` để hiểu chi tiết hơn.

---

**Version**: 2.0.0  
**Last Updated**: 2025-11-22
