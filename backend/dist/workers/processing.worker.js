"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processingWorker = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const processing_queue_1 = require("../queues/processing.queue");
const client_1 = require("../prisma/client");
const analysis_service_1 = require("../modules/analysis/analysis.service");
const logger_1 = require("../config/logger");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const analysisService = new analysis_service_1.AnalysisService();
exports.processingWorker = new bullmq_1.Worker(processing_queue_1.IMAGE_PROCESSING_QUEUE, async (job) => {
    const { mediaId, filePath } = job.data;
    logger_1.logger.info({ mediaId, jobId: job.id }, 'Processing job started');
    try {
        // Update status to PROCESSING
        await client_1.prisma.media.update({
            where: { id: mediaId },
            data: { status: 'PROCESSING' },
        });
        // Extract filename from the local URL (e.g. http://localhost:3000/uploads/uuid.webp)
        const filename = filePath.split('/').pop();
        const localFilePath = path_1.default.join(os_1.default.tmpdir(), 'uploads', filename);
        if (!fs_1.default.existsSync(localFilePath)) {
            throw new Error(`File not found: ${localFilePath}`);
        }
        // Run Analysis using the local file
        const results = await analysisService.runAllChecks(mediaId, localFilePath);
        // Save Analysis results and update Media status
        await client_1.prisma.$transaction([
            client_1.prisma.analysis.create({
                data: {
                    mediaId,
                    ...results,
                },
            }),
            client_1.prisma.media.update({
                where: { id: mediaId },
                data: { status: 'COMPLETED' },
            }),
            client_1.prisma.auditLog.create({
                data: {
                    mediaId,
                    action: 'ANALYSIS_COMPLETED',
                    details: results,
                },
            }),
        ]);
        logger_1.logger.info({ mediaId, jobId: job.id }, 'Processing job completed successfully');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.logger.error({ mediaId, jobId: job.id, error }, 'Processing job failed');
        await client_1.prisma.media.update({
            where: { id: mediaId },
            data: {
                status: 'FAILED',
                failureReason: errorMessage,
            },
        });
        throw error; // Let BullMQ handle retries
    }
}, {
    connection: redis_1.redisConnection,
    concurrency: 5,
});
exports.processingWorker.on('failed', (job, err) => {
    logger_1.logger.error({ jobId: job?.id, error: err.message }, 'Job failed permanently');
});
logger_1.logger.info('Processing worker initialized');
//# sourceMappingURL=processing.worker.js.map