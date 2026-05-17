import { prisma } from '../../prisma/client';
import { processingQueue } from '../../queues/processing.queue';
import { logger } from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export class UploadService {
  async handleUpload(file: Express.Multer.File) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save locally
    const filePath = path.join(uploadsDir, uniqueSuffix);
    await fs.promises.writeFile(filePath, file.buffer);

    const localUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${uniqueSuffix}`;

    const media = await prisma.media.create({
      data: {
        filename: uniqueSuffix,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        status: 'PENDING',
      },
    });

    logger.info({ mediaId: media.id }, 'Media record created, adding to queue');

    // Passing the local URL instead of S3 URL
    await processingQueue.add('process-image', {
      mediaId: media.id,
      filePath: localUrl, 
    });

    return {
      processingId: media.id,
      status: media.status,
    };
  }
}
