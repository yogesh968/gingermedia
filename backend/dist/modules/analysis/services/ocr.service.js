"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const tesseract_js_1 = require("tesseract.js");
const logger_1 = require("../../../config/logger");
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
class OCRService {
    /**
     * Preprocess image with Sharp to significantly improve OCR accuracy:
     * - Convert to grayscale
     * - Upscale to at least 1200px wide (Tesseract works best on larger images)
     * - Apply sharpening and normalise contrast
     * - Save as PNG (lossless) to avoid JPEG artefacts hurting OCR
     */
    async preprocessForOCR(imagePath) {
        const outPath = imagePath + '_ocr_preprocessed.png';
        try {
            const meta = await (0, sharp_1.default)(imagePath).metadata();
            const width = meta.width || 800;
            // Upscale to at least 2000px wide for small number plates
            const targetWidth = Math.max(2000, width * 2);
            await (0, sharp_1.default)(imagePath)
                .resize(targetWidth, null, { withoutEnlargement: false })
                .grayscale()
                .normalize()
                .sharpen({ sigma: 1.5, m1: 1.0, m2: 2.0 })
                .png()
                .toFile(outPath);
            return outPath;
        }
        catch (err) {
            logger_1.logger.warn(err, 'OCR preprocessing failed, using original image');
            return imagePath;
        }
    }
    async extractText(imagePath) {
        let worker = null;
        let preprocessedPath = null;
        try {
            // Preprocess image before OCR for much better accuracy
            preprocessedPath = await this.preprocessForOCR(imagePath);
            const tmpDir = os_1.default.tmpdir();
            // Try to copy bundled eng.traineddata to /tmp if present
            const possibleSources = [
                path_1.default.join(process.cwd(), 'eng.traineddata'),
                path_1.default.join(__dirname, '../../../../eng.traineddata'),
                path_1.default.join(__dirname, '../../../../../eng.traineddata'),
            ];
            const tmpDataPath = path_1.default.join(tmpDir, 'eng.traineddata');
            if (!fs_1.default.existsSync(tmpDataPath)) {
                for (const src of possibleSources) {
                    if (fs_1.default.existsSync(src)) {
                        logger_1.logger.info(`Copying eng.traineddata from ${src} to ${tmpDataPath}`);
                        fs_1.default.copyFileSync(src, tmpDataPath);
                        break;
                    }
                }
            }
            const dataExists = fs_1.default.existsSync(tmpDataPath);
            logger_1.logger.info({ dataExists, tmpDataPath }, 'Tesseract data path status');
            // Use 'write' so Tesseract can download from CDN if not bundled
            worker = await (0, tesseract_js_1.createWorker)('eng', 1, {
                langPath: tmpDir,
                cacheMethod: dataExists ? 'readOnly' : 'write',
            });
            // Run OCR with multiple PSM modes and pick the best result
            const results = [];
            const modes = [tesseract_js_1.PSM.SPARSE_TEXT, tesseract_js_1.PSM.AUTO, tesseract_js_1.PSM.SINGLE_LINE];
            for (const mode of modes) {
                await worker.setParameters({ tessedit_pageseg_mode: mode });
                const { data: { text } } = await worker.recognize(preprocessedPath);
                const trimmed = text.trim();
                if (trimmed.length > 0)
                    results.push(trimmed);
            }
            // Return the longest text found across all modes (most characters detected)
            const bestResult = results.sort((a, b) => b.length - a.length)[0] || '';
            logger_1.logger.info({ bestResult, modesTriedCount: modes.length }, 'OCR result');
            return bestResult;
        }
        catch (error) {
            logger_1.logger.error(error, 'OCR Extraction failed');
            return '';
        }
        finally {
            if (worker) {
                try {
                    await worker.terminate();
                }
                catch (_) { }
            }
            // Cleanup preprocessed temp file
            if (preprocessedPath && preprocessedPath !== imagePath && fs_1.default.existsSync(preprocessedPath)) {
                try {
                    fs_1.default.unlinkSync(preprocessedPath);
                }
                catch (_) { }
            }
        }
    }
    validateIndianPlate(text) {
        if (!text || text.length === 0) {
            return { isValid: false, plates: [] };
        }
        const upper = text.toUpperCase();
        // Fix common OCR misreads: O→0, I→1, S→5, Z→2, B→8, Q→0
        const corrected = upper
            .replace(/O/g, '0')
            .replace(/I(?=[0-9])/g, '1')
            .replace(/S(?=[0-9])/g, '5')
            .replace(/Z(?=[0-9])/g, '2')
            .replace(/B(?=[0-9])/g, '8');
        // Clean: keep only alphanumeric characters
        const clean = corrected.replace(/[^A-Z0-9]/g, '');
        const cleanOriginal = upper.replace(/[^A-Z0-9]/g, '');
        // Standard Indian plate regex: e.g. MH12AB3456
        const strictRegex = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}/g;
        let matches = clean.match(strictRegex) || cleanOriginal.match(strictRegex);
        // Lenient fallback: 2 letters, some chars, 4 digits
        if (!matches || matches.length === 0) {
            const lenientRegex = /[A-Z]{2}[A-Z0-9]{1,5}[0-9]{4}/g;
            matches = clean.match(lenientRegex) || cleanOriginal.match(lenientRegex) || null;
        }
        return {
            isValid: !!matches && matches.length > 0,
            plates: matches || [],
        };
    }
}
exports.OCRService = OCRService;
//# sourceMappingURL=ocr.service.js.map