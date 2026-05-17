import { prisma } from '../../prisma/client';
import { processingQueue } from '../../queues/processing.queue';
import { logger } from '../../config/logger';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../../config';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3Client = new S3Client({
  region: config.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY || '',
    ...(config.AWS_SESSION_TOKEN && { sessionToken: config.AWS_SESSION_TOKEN }),
  },
});

export class UploadService {
  async handleUpload(file: Express.Multer.File) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    const bucketName = config.AWS_BUCKET_NAME || 'ginger-media-bucket';

    // Upload to S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueSuffix,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const s3Url = `https://${bucketName}.s3.${config.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueSuffix}`;

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

    await processingQueue.add('process-image', {
      mediaId: media.id,
      filePath: s3Url,
    });

    return {
      processingId: media.id,
      status: media.status,
    };
  }
}
