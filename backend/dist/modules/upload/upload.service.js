"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const client_1 = require("../../prisma/client");
const logger_1 = require("../../config/logger");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const analysis_service_1 = require("../analysis/analysis.service");
const analysisService = new analysis_service_1.AnalysisService();
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
        const media = await client_1.prisma.media.create({
            data: {
                filename: uniqueSuffix,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                status: 'PROCESSING', // start as PROCESSING since we are doing it sync
            },
        });
        logger_1.logger.info({ mediaId: media.id }, 'Media record created, starting analysis synchronously');
        // Run Analysis synchronously
        try {
            const results = await analysisService.runAllChecks(media.id, filePath);
            await client_1.prisma.$transaction([
                client_1.prisma.analysis.create({
                    data: {
                        mediaId: media.id,
                        ...results,
                    },
                }),
                client_1.prisma.media.update({
                    where: { id: media.id },
                    data: { status: 'COMPLETED' },
                }),
                client_1.prisma.auditLog.create({
                    data: {
                        mediaId: media.id,
                        action: 'ANALYSIS_COMPLETED',
                        details: results,
                    },
                }),
            ]);
            logger_1.logger.info({ mediaId: media.id }, 'Synchronous analysis completed successfully');
            return {
                processingId: media.id,
                status: 'COMPLETED',
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger_1.logger.error({ mediaId: media.id, error }, 'Synchronous analysis failed');
            await client_1.prisma.media.update({
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
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map