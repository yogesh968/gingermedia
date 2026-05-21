"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const client_1 = require("../../prisma/client");
const processing_queue_1 = require("../../queues/processing.queue");
const logger_1 = require("../../config/logger");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
class UploadService {
    async handleUpload(file) {
        const uniqueSuffix = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        // Ensure uploads directory exists in /tmp for serverless environments
        const uploadsDir = path_1.default.join(os_1.default.tmpdir(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        // Save locally
        const filePath = path_1.default.join(uploadsDir, uniqueSuffix);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        const localUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${uniqueSuffix}`;
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
        // Passing the local URL instead of S3 URL
        await processing_queue_1.processingQueue.add('process-image', {
            mediaId: media.id,
            filePath: localUrl,
        });
        return {
            processingId: media.id,
            status: media.status,
        };
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map