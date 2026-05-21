"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisService = void 0;
const blur_service_1 = require("./services/blur.service");
const brightness_service_1 = require("./services/brightness.service");
const ocr_service_1 = require("./services/ocr.service");
const duplicate_service_1 = require("./services/duplicate.service");
const heuristics_service_1 = require("./services/heuristics.service");
const logger_1 = require("../../config/logger");
// Wraps a promise with a timeout. If it times out, returns the fallback value.
function withTimeout(promise, ms, fallback) {
    return new Promise((resolve) => {
        const timer = setTimeout(() => {
            logger_1.logger.warn(`Analysis step timed out after ${ms}ms, using fallback`);
            resolve(fallback);
        }, ms);
        promise.then((val) => { clearTimeout(timer); resolve(val); }, (err) => { clearTimeout(timer); logger_1.logger.error(err, 'Analysis step failed, using fallback'); resolve(fallback); });
    });
}
class AnalysisService {
    constructor() {
        this.blurService = new blur_service_1.BlurService();
        this.brightnessService = new brightness_service_1.BrightnessService();
        this.ocrService = new ocr_service_1.OCRService();
        this.duplicateService = new duplicate_service_1.DuplicateService();
        this.heuristicsService = new heuristics_service_1.HeuristicsService();
    }
    async runAllChecks(mediaId, imagePath) {
        logger_1.logger.info({ mediaId }, 'Starting image analysis with per-step timeouts');
        const STEP_TIMEOUT_MS = 20000; // 20s per step
        const blurFallback = { score: 0, confidence: 0, isBlurry: false };
        const brightnessFallback = { score: 128, isLowLight: false, isOverexposed: false };
        const ocrFallback = '';
        const heuristicsFallback = { dimensions: { width: 0, height: 0 }, isScreenshot: false, isTampered: false, format: undefined, aspectRatio: 1, qualityThresholdMet: false };
        const hashFallback = '0000000000000000';
        // Run all steps in parallel, each with independent timeout + error handling
        const [blur, brightness, ocrText, heuristics, hash] = await Promise.all([
            withTimeout(this.blurService.detectBlur(imagePath), STEP_TIMEOUT_MS, blurFallback),
            withTimeout(this.brightnessService.analyzeBrightness(imagePath), STEP_TIMEOUT_MS, brightnessFallback),
            withTimeout(this.ocrService.extractText(imagePath), 25000, ocrFallback), // OCR gets 25s
            withTimeout(this.heuristicsService.analyze(imagePath), STEP_TIMEOUT_MS, heuristicsFallback),
            withTimeout(this.duplicateService.generateHash(imagePath), STEP_TIMEOUT_MS, hashFallback),
        ]);
        const isDuplicate = await withTimeout(this.duplicateService.findDuplicates(hash, mediaId), 5000, false);
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