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
class OCRService {
    async extractText(imagePath) {
        let worker = null;
        try {
            // Vercel Serverless Function compatibility:
            // We must trick NFT into bundling the file by using path.join(__dirname, ...)
            const sourceDataPath = path_1.default.join(process.cwd(), 'eng.traineddata');
            const fallbackDataPath = path_1.default.join(__dirname, '../../../../eng.traineddata');
            const tmpDir = os_1.default.tmpdir();
            const tmpDataPath = path_1.default.join(tmpDir, 'eng.traineddata');
            if (!fs_1.default.existsSync(tmpDataPath)) {
                if (fs_1.default.existsSync(sourceDataPath)) {
                    fs_1.default.copyFileSync(sourceDataPath, tmpDataPath);
                }
                else if (fs_1.default.existsSync(fallbackDataPath)) {
                    fs_1.default.copyFileSync(fallbackDataPath, tmpDataPath);
                }
                else {
                    logger_1.logger.warn('eng.traineddata not found in deployment! Tesseract will attempt to download it.');
                }
            }
            worker = await (0, tesseract_js_1.createWorker)('eng', 1, {
                langPath: tmpDir,
                cacheMethod: fs_1.default.existsSync(tmpDataPath) ? 'readOnly' : 'write',
            });
            await worker.setParameters({
                tessedit_pageseg_mode: tesseract_js_1.PSM.SPARSE_TEXT,
            });
            const { data: { text } } = await worker.recognize(imagePath);
            return text.trim();
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
        }
    }
    validateIndianPlate(text) {
        // Relaxed regex to catch more common Indian Number Plate formats even if OCR is slightly noisy
        const plateRegex = /[A-Z]{2}[0-9OIQ]{1,2}[A-Z0-9]{1,3}[0-9OIZSB]{4}/g;
        const cleanText = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // Also try a very relaxed match if the strict one fails
        const relaxedRegex = /[A-Z]{2}.*[0-9]{4}/;
        let matches = cleanText.match(plateRegex);
        let isValid = !!matches && matches.length > 0;
        if (!isValid && text.toUpperCase().replace(/[^A-Z0-9]/g, ' ').match(relaxedRegex)) {
            matches = [text.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 10)];
            isValid = true; // lenient fallback
        }
        return {
            isValid,
            plates: matches || [],
        };
    }
}
exports.OCRService = OCRService;
//# sourceMappingURL=ocr.service.js.map