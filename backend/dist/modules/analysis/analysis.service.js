"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const blur_service_1 = require("./services/blur.service");
const brightness_service_1 = require("./services/brightness.service");
const ocr_service_1 = require("./services/ocr.service");
const duplicate_service_1 = require("./services/duplicate.service");
const heuristics_service_1 = require("./services/heuristics.service");
const logger_1 = require("../../config/logger");
class AnalysisService {
    constructor() {
        this.blurService = new blur_service_1.BlurService();
        this.brightnessService = new brightness_service_1.BrightnessService();
        this.ocrService = new ocr_service_1.OCRService();
        this.duplicateService = new duplicate_service_1.DuplicateService();
        this.heuristicsService = new heuristics_service_1.HeuristicsService();
    }
    async runAllChecks(mediaId, imagePath) {
        logger_1.logger.info({ mediaId }, 'Starting image analysis');
        const [blur, brightness, ocrText, heuristics, hash] = await Promise.all([
            this.blurService.detectBlur(imagePath),
            this.brightnessService.analyzeBrightness(imagePath),
            this.ocrService.extractText(imagePath),
            this.heuristicsService.analyze(imagePath),
            this.duplicateService.generateHash(imagePath),
        ]);
        const isDuplicate = await this.duplicateService.findDuplicates(hash, mediaId);
        const plateValidation = this.ocrService.validateIndianPlate(ocrText);
        const results = {
            blurScore: blur.score,
            blurConfidence: blur.confidence,
            brightnessScore: brightness.score,
            isDuplicate,
            perceptualHash: hash,
            ocrResult: ocrText,
            plateNumber: plateValidation.plates[0] || null,
            isPlateValid: plateValidation.isValid,
            isScreenshot: heuristics.isScreenshot,
            isTampered: heuristics.isTampered,
            dimensions: heuristics.dimensions,
            rawResult: {
                heuristics,
                brightness,
                blur,
                plateValidation,
            }
        };
        logger_1.logger.info({ mediaId }, 'Image analysis completed');
        return results;
    }
}
exports.AnalysisService = AnalysisService;
//# sourceMappingURL=analysis.service.js.map