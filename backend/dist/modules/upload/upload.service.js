"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const client_1 = require("../../prisma/client");
const processing_queue_1 = require("../../queues/processing.queue");
const logger_1 = require("../../config/logger");
const client_s3_1 = require("@aws-sdk/client-s3");
const config_1 = require("../../config");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const s3Client = new client_s3_1.S3Client({
    region: config_1.config.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: config_1.config.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: config_1.config.AWS_SECRET_ACCESS_KEY || '',
    },
});
class UploadService {
    async handleUpload(file) {
        const uniqueSuffix = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        const bucketName = config_1.config.AWS_BUCKET_NAME || 'ginger-media-bucket';
        // Upload to S3
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: uniqueSuffix,
            Body: file.buffer,
            ContentType: file.mimetype,
        }));
        const s3Url = `https://${bucketName}.s3.${config_1.config.AWS_REGION || 'us-east-1'}.amazonaws.com/${uniqueSuffix}`;
        const media = await client_1.prisma.media.create({
            data: {
                filename: uniqueSuffix,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                status: 'PENDING',
            },
        });
        logger_1.logger.info({ mediaId: media.id }, 'Media record created, adding to queue');
        await processing_queue_1.processingQueue.add('process-image', {
            mediaId: media.id,
            filePath: s3Url,
        });
        return {
            processingId: media.id,
            status: media.status,
        };
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map