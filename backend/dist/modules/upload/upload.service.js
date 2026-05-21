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
// Master timeout: 55s to safely stay within Vercel's 60s limit
const MASTER_TIMEOUT_MS = 55000;
class UploadService {
    async handleUpload(file) {
        const uniqueSuffix = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        // Ensure uploads directory exists in /tmp (writable on Vercel)
        const uploadsDir = path_1.default.join(os_1.default.tmpdir(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadsDir, uniqueSuffix);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        const media = await client_1.prisma.media.create({
            data: {
                filename: uniqueSuffix,
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                status: 'PROCESSING',
            },
        });
        logger_1.logger.info({ mediaId: media.id }, 'Media record created, starting analysis');
        // Wrap the entire analysis in a master timeout
        const analysisPromise = analysisService.runAllChecks(media.id, filePath);
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), MASTER_TIMEOUT_MS));
        const results = await Promise.race([analysisPromise, timeoutPromise]);
        // If master timeout fired, mark as failed
        if (results === null) {
            logger_1.logger.error({ mediaId: media.id }, 'Analysis timed out at master level');
            await client_1.prisma.media.update({
                where: { id: media.id },
                data: { status: 'FAILED', failureReason: 'Analysis timed out. Please try again.' },
            });
            return { processingId: media.id, status: 'FAILED', error: 'Analysis timed out' };
        }
        try {
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
            logger_1.logger.info({ mediaId: media.id }, 'Analysis completed and saved');
            // Cleanup tmp file
            fs_1.default.unlink(filePath, () => { });
            return { processingId: media.id, status: 'COMPLETED' };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Database error';
            logger_1.logger.error({ mediaId: media.id, error }, 'Failed to save analysis results');
            await client_1.prisma.media.update({
                where: { id: media.id },
                data: { status: 'FAILED', failureReason: errorMessage },
            });
            return { processingId: media.id, status: 'FAILED', error: errorMessage };
        }
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map