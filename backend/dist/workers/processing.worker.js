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
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
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
        // Download the remote S3 URL to a temporary file for analysis
        const response = await axios_1.default.get(filePath, { responseType: 'arraybuffer' });
        const tempFilePath = path_1.default.join(os_1.default.tmpdir(), `${(0, uuid_1.v4)()}.jpg`);
        fs_1.default.writeFileSync(tempFilePath, Buffer.from(response.data));
        // Run Analysis using the temporary file
        let results;
        try {
            results = await analysisService.runAllChecks(mediaId, tempFilePath);
        }
        finally {
            // Cleanup temp file
            if (fs_1.default.existsSync(tempFilePath)) {
                fs_1.default.unlinkSync(tempFilePath);
            }
        }
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