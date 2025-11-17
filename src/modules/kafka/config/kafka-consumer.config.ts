export interface KafkaConsumerConfig {
  clientId: string;
  groupId: string;
  brokers: string[];
  topic: string;
  autoOffsetReset?: 'earliest' | 'latest' | 'none';
  sessionTimeout?: number;
  heartbeatInterval?: number;
  maxWaitTimeInMs?: number;
  autoCommit?: boolean;
  fetchBatchSize?: number;
  retry?: {
    initialRetryTime?: number;
    maxRetryTime?: number;
    retries?: number;
  };
}

export const MOVIE_CONFIG: KafkaConsumerConfig = {
  clientId: 'movie-view-consumer',
  groupId: 'movie-view-group',
  brokers: ['localhost:9092'],
  topic: 'movie-views',
  // autoOffsetReset: 'earliest',
  // sessionTimeout: 30000,
  // heartbeatInterval: 10000,
  // maxWaitTimeInMs: 5000,
  // retry: {
  //   initialRetryTime: 100,
  //   maxRetryTime: 30000,
  //   retries: 5
  // }
};

export const ANALYTICS_STREAM_CONFIG: KafkaConsumerConfig = {
  clientId: 'analytics-consumer',
  groupId: 'analytics-group',
  brokers: ['localhost:9092'],
  topic: 'analytics-events',
  autoOffsetReset: 'earliest',
  sessionTimeout: 30000,
  heartbeatInterval: 10000,
  maxWaitTimeInMs: 5000,
  retry: {
    initialRetryTime: 100,
    maxRetryTime: 30000,
    retries: 5
  },
  autoCommit: true,
  fetchBatchSize: 100,
};
