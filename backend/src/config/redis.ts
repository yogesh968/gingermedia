import { ConnectionOptions } from 'bullmq';
import { config } from './index';

export const redisConnection: ConnectionOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  ...(config.REDIS_PASSWORD ? { tls: {} } : {}),
  maxRetriesPerRequest: null,
};
