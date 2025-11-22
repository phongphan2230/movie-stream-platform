# 🔄 Migration Guide - Kafka Architecture

## Hướng dẫn chuyển đổi từ cấu trúc cũ sang cấu trúc mới

---

## 📊 So Sánh Cấu Trúc

### ❌ CŨ (Không chuẩn)
```
kafka/
├── consumer/
│   ├── kafka-consumer-index.service.ts    ❌ Phức tạp, khó mở rộng
│   ├── kafka-consumer-index.module.ts     ❌ Dynamic module không cần thiết
│   └── movie/
│       ├── kafka-consumer-movie.module.ts ❌ Inject controller/service không liên quan
│       └── kafka-consumer-movie.service.ts ❌ Phụ thuộc vào index service
└── producer/
    ├── kafka-producer.module.ts           ✅ OK
    └── kafka-producer.service.ts          ✅ OK (nhưng thiếu typed methods)
```

### ✅ MỚI (Chuẩn)
```
kafka/
├── config/
│   └── kafka.config.ts                    ✅ Centralized config
├── consumer/
│   ├── base/
│   │   ├── kafka-consumer.interface.ts    ✅ Type-safe interface
│   │   └── kafka-consumer-base.service.ts ✅ Reusable base class
│   ├── movie/
│   │   ├── kafka-consumer-movie.module.ts ✅ Simple, clean
│   │   └── kafka-consumer-movie.service.ts ✅ Extends base class
│   ├── analytics/
│   │   ├── kafka-consumer-analytics.module.ts ✅ New consumer
│   │   └── kafka-consumer-analytics.service.ts ✅ Separate domain
│   └── kafka-consumer-index.module.ts     ✅ Simple aggregator
└── producer/
    ├── kafka-producer.module.ts           ✅ Global module
    └── kafka-producer.service.ts          ✅ Enhanced with typed methods
```

---

## 🚀 Các Bước Migration

### Bước 1: Backup Code Cũ (Tùy chọn)

```bash
# Tạo backup folder
mkdir src/modules/kafka-old
cp -r src/modules/kafka/* src/modules/kafka-old/
```

### Bước 2: Files Đã Được Tạo Mới

Các files sau đã được tạo/cập nhật:

✅ **Mới tạo:**
- `config/kafka.config.ts`
- `consumer/base/kafka-consumer.interface.ts`
- `consumer/base/kafka-consumer-base.service.ts`
- `consumer/analytics/kafka-consumer-analytics.module.ts`
- `consumer/analytics/kafka-consumer-analytics.service.ts`
- `README.md`
- `USAGE_EXAMPLES.ts`

✅ **Đã cập nhật:**
- `consumer/movie/kafka-consumer-movie.service.ts`
- `consumer/movie/kafka-consumer-movie.module.ts`
- `consumer/kafka-consumer-index.module.ts`
- `producer/kafka-producer.service.ts`

### Bước 3: Files Cần Xóa

❌ **Có thể xóa (DEPRECATED):**
- `consumer/kafka-consumer-index.service.ts` - Không dùng nữa
- `consumer/analytic/` (folder trống) - Đã thay bằng `analytics/`
- `config/kafka-consumer.config.ts` (nếu có) - Đã merge vào `kafka.config.ts`

```bash
# Xóa files deprecated
rm src/modules/kafka/consumer/kafka-consumer-index.service.ts
rmdir src/modules/kafka/consumer/analytic
```

### Bước 4: Cập Nhật App Module

**CŨ:**
```typescript
// app.module.ts
@Module({
  imports: [
    KafkaProducerModule,
    MovieConsumerModule.register(), // ❌ Dynamic module
  ],
})
export class AppModule {}
```

**MỚI:**
```typescript
// app.module.ts
@Module({
  imports: [
    KafkaProducerModule,           // ✅ Global module
    KafkaConsumerIndexModule,      // ✅ Aggregate all consumers
  ],
})
export class AppModule {}
```

### Bước 5: Cập Nhật Services Sử Dụng Producer

**CŨ:**
```typescript
// movie.service.ts
async trackView(userId: string, movieId: string) {
  await this.kafkaProducer.sendViewEvent(userId, movieId);
}
```

**MỚI (Nhiều options hơn):**
```typescript
// movie.service.ts
async trackView(userId: string, movieId: string) {
  // Option 1: Sử dụng method có sẵn
  await this.kafkaProducer.sendMovieViewEvent(userId, movieId);

  // Option 2: Sử dụng method generic với metadata
  await this.kafkaProducer.sendMovieEvent('VIEW', userId, movieId, {
    source: 'web',
    duration: 120,
  });

  // Option 3: Custom message
  await this.kafkaProducer.sendMessage('custom-topic', { ... });
}
```

---

## 🔍 Kiểm Tra Migration

### 1. Compile Check

```bash
npm run build
```

Nếu có lỗi TypeScript, check:
- Import paths đã đúng chưa
- Interfaces đã match chưa

### 2. Runtime Check

```bash
npm run start:dev
```

Kiểm tra logs:
```
✅ Kafka Producer connected
✅ Kafka consumer connected: movie-consumer
📡 Subscribed to topic: movie-events
📡 Subscribed to topic: movie-views
✅ Kafka consumer connected: analytics-consumer
📡 Subscribed to topic: movie-views
📡 Subscribed to topic: user-actions
```

### 3. Test Producer

```typescript
// Test trong controller hoặc service
async testKafka() {
  await this.kafkaProducer.sendMovieViewEvent('user123', 'movie456');
  // Check consumer logs để xem có nhận được không
}
```

### 4. Check Consumer Logs

Sau khi send event, bạn sẽ thấy logs:
```
📨 Received message from topic: movie-events, partition: 0
👁️ Processing VIEW event for movie: movie456 by user: user123
```

---

## ⚠️ Breaking Changes

### 1. Consumer Service Constructor

**CŨ:**
```typescript
constructor(
  @Inject('MOVIE_CONSUMER') private kafkaConsumer: KafkaConsumerService
) {}
```

**MỚI:**
```typescript
constructor() {
  super(KAFKA_CONFIG.consumers.movie, 'MovieConsumer');
}
```

### 2. Message Handling

**CŨ:**
```typescript
async onModuleInit() {
  await this.kafkaConsumer.subscribe(async (payload) => {
    // Handle message
  });
}
```

**MỚI:**
```typescript
protected async handleMessage(payload: EachMessagePayload): Promise<void> {
  const event = this.parseMessage<MovieEvent>(payload);
  // Handle message
}
```

### 3. Module Registration

**CŨ:**
```typescript
MovieConsumerModule.register() // Dynamic module
```

**MỚI:**
```typescript
MovieConsumerModule // Static module
```

---

## 🎯 Lợi Ích Sau Migration

### 1. **Dễ Mở Rộng**
- Thêm consumer mới chỉ cần 4 bước đơn giản
- Không cần modify code cũ

### 2. **Type Safety**
- TypeScript interfaces cho tất cả events
- Autocomplete khi code

### 3. **Maintainability**
- Code rõ ràng, dễ đọc
- Separation of concerns
- Reusable base class

### 4. **Better Error Handling**
- Centralized error handling
- Graceful degradation
- Detailed logging

### 5. **Performance**
- Single producer instance (Singleton)
- Independent consumers (không block nhau)
- Message key partitioning

---

## 📝 Checklist

Sau khi migration, check các items sau:

- [ ] ✅ Tất cả files mới đã được tạo
- [ ] ✅ Files deprecated đã được xóa
- [ ] ✅ App module đã được cập nhật
- [ ] ✅ `npm run build` thành công
- [ ] ✅ `npm run start:dev` thành công
- [ ] ✅ Producer logs hiển thị "connected"
- [ ] ✅ Consumer logs hiển thị "connected" và "subscribed"
- [ ] ✅ Test send event thành công
- [ ] ✅ Consumer nhận và xử lý event thành công
- [ ] ✅ Không có error logs

---

## 🆘 Troubleshooting

### Lỗi: "Cannot find module '@nestjs/common'"

```bash
npm install
```

### Lỗi: "Producer not initialized"

- Check xem `KafkaProducerModule` đã được import vào `AppModule` chưa
- Check Kafka broker có đang chạy không

### Lỗi: "Consumer không nhận message"

1. Check topic name có đúng không
2. Check Kafka broker connection
3. Check consumer group ID
4. Check logs để xem consumer có subscribe thành công không

### Consumer không start

1. Check `KafkaConsumerIndexModule` đã được import chưa
2. Check config trong `kafka.config.ts`
3. Check logs để xem error message

---

## 📞 Support

Nếu gặp vấn đề trong quá trình migration:

1. Check logs carefully
2. Đọc lại README.md
3. Xem USAGE_EXAMPLES.ts
4. Compare với code mẫu trong guide này

---

**Good luck with your migration! 🚀**
