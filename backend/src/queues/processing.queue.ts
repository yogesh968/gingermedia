import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';
import { logger } from '../config/logger';

export const IMAGE_PROCESSING_QUEUE = 'image-processing';

export const processingQueue = new Queue(IMAGE_PROCESSING_QUEUE, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

logger.info(`Queue initialized: ${IMAGE_PROCESSING_QUEUE}`);
