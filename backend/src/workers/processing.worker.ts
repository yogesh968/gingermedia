import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis';
import { IMAGE_PROCESSING_QUEUE } from '../queues/processing.queue';
import { prisma } from '../prisma/client';
import { AnalysisService } from '../modules/analysis/analysis.service';
import { logger } from '../config/logger';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

const s3Client = new S3Client({
  region: config.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY || '',
    ...(config.AWS_SESSION_TOKEN && { sessionToken: config.AWS_SESSION_TOKEN }),
  },
});

const analysisService = new AnalysisService();

export const processingWorker = new Worker(
  IMAGE_PROCESSING_QUEUE,
  async (job: Job) => {
    const { mediaId, filePath } = job.data;
    
    logger.info({ mediaId, jobId: job.id }, 'Processing job started');

    try {
      await prisma.media.update({
        where: { id: mediaId },
        data: { status: 'PROCESSING' },
      });

      // Download image from S3 using SDK
      const s3Key = filePath.split('.amazonaws.com/')[1];
      const s3Response = await s3Client.send(new GetObjectCommand({
        Bucket: config.AWS_BUCKET_NAME || 'ginger-media-bucket',
        Key: s3Key,
      }));
      const chunks: Buffer[] = [];
      for await (const chunk of s3Response.Body as Readable) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const tempFilePath = path.join(os.tmpdir(), `${uuidv4()}.jpg`);
      fs.writeFileSync(tempFilePath, Buffer.concat(chunks));

      // Run Analysis
      let results;
      try {
        results = await analysisService.runAllChecks(mediaId, tempFilePath);
      } finally {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      }

      await prisma.$transaction([
        prisma.analysis.create({
          data: { mediaId, ...results },
        }),
        prisma.media.update({
          where: { id: mediaId },
          data: { status: 'COMPLETED' },
        }),
        prisma.auditLog.create({
          data: { mediaId, action: 'ANALYSIS_COMPLETED', details: results as any },
        }),
      ]);

      logger.info({ mediaId, jobId: job.id }, 'Processing job completed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ mediaId, jobId: job.id, error }, 'Processing job failed');
      await prisma.media.update({
        where: { id: mediaId },
        data: { status: 'FAILED', failureReason: errorMessage },
      });
      throw error;
    }
  },
  { connection: redisConnection, concurrency: 5 }
);

processingWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, error: err.message }, 'Job failed permanently');
});

logger.info('Processing worker initialized');
