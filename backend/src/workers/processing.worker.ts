import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { IMAGE_PROCESSING_QUEUE } from '../queues/processing.queue';
import { prisma } from '../prisma/client';
import { AnalysisService } from '../modules/analysis/analysis.service';
import { logger } from '../config/logger';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

      // Download the remote S3 URL to a temporary file for analysis
      const response = await axios.get(filePath, { responseType: 'arraybuffer' });
      const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.jpg`);
      fs.writeFileSync(tempFilePath, Buffer.from(response.data));

      // Run Analysis using the temporary file
      let results;
      try {
        results = await analysisService.runAllChecks(mediaId, tempFilePath);
      } finally {
        // Cleanup temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      }

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
