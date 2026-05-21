import { prisma } from '../../prisma/client';
import { logger } from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { AnalysisService } from '../analysis/analysis.service';
import sharp from 'sharp';

const analysisService = new AnalysisService();

// Master timeout: 55s to safely stay within Vercel's 60s limit
const MASTER_TIMEOUT_MS = 55000;

export class UploadService {
  async handleUpload(file: Express.Multer.File) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;

    // Ensure uploads directory exists in /tmp (writable on Vercel)
    const uploadsDir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueSuffix);
    await fs.promises.writeFile(filePath, file.buffer);

    const media = await prisma.media.create({
      data: {
        filename: uniqueSuffix,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'PROCESSING',
      },
    });

    logger.info({ mediaId: media.id }, 'Media record created, starting analysis');

    // Wrap the entire analysis in a master timeout
    const analysisPromise = analysisService.runAllChecks(media.id, filePath);
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), MASTER_TIMEOUT_MS)
    );

    const results = await Promise.race([analysisPromise, timeoutPromise]);

    // Generate base64 string for Vercel persistent display
    let base64Image = '';
    try {
      const compressedBuffer = await sharp(file.buffer)
        .resize(800, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      base64Image = compressedBuffer.toString('base64');
    } catch (err) {
      logger.warn(err, 'Failed to generate base64 image preview');
    }

    if (results && results !== null) {
      // Inject base64 into rawResult
      if (results.rawResult) {
        (results.rawResult as any).base64Image = base64Image;
      }
    }

    // If master timeout fired, mark as failed
    if (results === null) {
      logger.error({ mediaId: media.id }, 'Analysis timed out at master level');
      await prisma.media.update({
        where: { id: media.id },
        data: { status: 'FAILED', failureReason: 'Analysis timed out. Please try again.' },
      });
      return { processingId: media.id, status: 'FAILED', error: 'Analysis timed out' };
    }

    try {
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

      logger.info({ mediaId: media.id }, 'Analysis completed and saved');

      // Cleanup tmp file (Disabled on Vercel to allow the frontend to fetch the image from the warm instance)
      // fs.unlink(filePath, () => {});

      return { processingId: media.id, status: 'COMPLETED' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Database error';
      logger.error({ mediaId: media.id, error }, 'Failed to save analysis results');
      await prisma.media.update({
        where: { id: media.id },
        data: { status: 'FAILED', failureReason: errorMessage },
      });
      return { processingId: media.id, status: 'FAILED', error: errorMessage };
    }
  }
}
