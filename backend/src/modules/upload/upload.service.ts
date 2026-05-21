import { prisma } from '../../prisma/client';
import { logger } from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { AnalysisService } from '../analysis/analysis.service';

const analysisService = new AnalysisService();

export class UploadService {
  async handleUpload(file: Express.Multer.File) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    
    // Ensure uploads directory exists in /tmp for serverless environments
    const uploadsDir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save locally
    const filePath = path.join(uploadsDir, uniqueSuffix);
    await fs.promises.writeFile(filePath, file.buffer);

    const media = await prisma.media.create({
      data: {
        filename: uniqueSuffix,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'PROCESSING', // start as PROCESSING since we are doing it sync
      },
    });

    logger.info({ mediaId: media.id }, 'Media record created, starting analysis synchronously');

    // Run Analysis synchronously
    try {
      const results = await analysisService.runAllChecks(media.id, filePath);

      await prisma.$transaction([
        prisma.analysis.create({
          data: {
            mediaId: media.id,
            ...results,
          },
        }),
        prisma.media.update({
          where: { id: media.id },
          data: { status: 'COMPLETED' },
        }),
        prisma.auditLog.create({
          data: {
            mediaId: media.id,
            action: 'ANALYSIS_COMPLETED',
            details: results as any,
          },
        }),
      ]);

      logger.info({ mediaId: media.id }, 'Synchronous analysis completed successfully');
      
      return {
        processingId: media.id,
        status: 'COMPLETED',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ mediaId: media.id, error }, 'Synchronous analysis failed');

      await prisma.media.update({
        where: { id: media.id },
        data: { 
          status: 'FAILED',
          failureReason: errorMessage,
        },
      });

      return {
        processingId: media.id,
        status: 'FAILED',
        error: errorMessage,
      };
    }
  }
}
