import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { IMAGE_PROCESSING_QUEUE } from '../queues/processing.queue';
import { prisma } from '../prisma/client';
import { AnalysisService } from '../modules/analysis/analysis.service';
import { logger } from '../config/logger';
import fs from 'fs';
import path from 'path';
import os from 'os';

const analysisService = new AnalysisService();

export const processingWorker = new Worker(
  IMAGE_PROCESSING_QUEUE,
  async (job: Job) => {
    const { mediaId, filePath } = job.data;
    
    logger.info({ mediaId, jobId: job.id }, 'Processing job started');

    try {
      // Update status to PROCESSING
      await prisma.media.update({
        where: { id: mediaId },
        data: { status: 'PROCESSING' },
      });

      // Extract filename from the local URL (e.g. http://localhost:3000/uploads/uuid.webp)
      const filename = filePath.split('/').pop();
      const localFilePath = path.join(os.tmpdir(), 'uploads', filename);

      if (!fs.existsSync(localFilePath)) {
        throw new Error(`File not found: ${localFilePath}`);
      }

      // Run Analysis using the local file
      const results = await analysisService.runAllChecks(mediaId, localFilePath);

      // Save Analysis results and update Media status
      await prisma.$transaction([
        prisma.analysis.create({
          data: {
            mediaId,
            ...results,
          },
        }),
        prisma.media.update({
          where: { id: mediaId },
          data: { status: 'COMPLETED' },
        }),
        prisma.auditLog.create({
          data: {
            mediaId,
            action: 'ANALYSIS_COMPLETED',
            details: results as any,
          },
        }),
      ]);

      logger.info({ mediaId, jobId: job.id }, 'Processing job completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ mediaId, jobId: job.id, error }, 'Processing job failed');

      await prisma.media.update({
        where: { id: mediaId },
        data: { 
          status: 'FAILED',
          failureReason: errorMessage,
        },
      });

      throw error; // Let BullMQ handle retries
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

processingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed permanently');
});

logger.info('Processing worker initialized');
