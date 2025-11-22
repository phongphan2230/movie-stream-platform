// Centralized Kafka Configuration
export const KAFKA_CONFIG = {
  // Producer Config
  producer: {
    clientId: process.env.KAFKA_CLIENT_ID || 'movie-stream-producer',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').filter(Boolean),
    connectionTimeout: 5000,
    retry: {
      initialRetryTime: 100,
      retries: 8,
    },
  },

  // Consumer Configs - Mỗi consumer có config riêng
  consumers: {
    movie: {
      clientId: 'movie-consumer',
      groupId: 'movie-group',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').filter(Boolean),
      topics: ['movie-events', 'movie-views'], // Có thể subscribe nhiều topics
    },
    analytics: {
      clientId: 'analytics-consumer',
      groupId: 'analytics-group',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').filter(Boolean),
      topics: ['movie-views', 'user-actions'],
    },
    notification: {
      clientId: 'notification-consumer',
      groupId: 'notification-group',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(',').filter(Boolean),
      topics: ['notification-events'],
    },
  },

  // Topic Names - Centralized topic management
  topics: {
    MOVIE_EVENTS: 'movie-events',
    MOVIE_VIEWS: 'movie-views',
    USER_ACTIONS: 'user-actions',
    NOTIFICATION_EVENTS: 'notification-events',
  },
};

export type ConsumerName = keyof typeof KAFKA_CONFIG.consumers;
