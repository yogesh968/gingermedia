"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingQueue = exports.IMAGE_PROCESSING_QUEUE = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
exports.IMAGE_PROCESSING_QUEUE = 'image-processing';
exports.processingQueue = new bullmq_1.Queue(exports.IMAGE_PROCESSING_QUEUE, {
    connection: redis_1.redisConnection,
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
logger_1.logger.info(`Queue initialized: ${exports.IMAGE_PROCESSING_QUEUE}`);
//# sourceMappingURL=processing.queue.js.map