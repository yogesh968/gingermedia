"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const tesseract_js_1 = require("tesseract.js");
const logger_1 = require("../../../config/logger");
const os_1 = __importDefault(require("os"));
class OCRService {
    async extractText(imagePath) {
        let worker = null;
        try {
            worker = await (0, tesseract_js_1.createWorker)('eng', 1, {
                langPath: os_1.default.tmpdir(),
                cacheMethod: 'readOnly',
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
        const plateRegex = /[A-Z]{2}[0-9OIQ]{1,2}[A-Z0-9]{1,3}[0-9OIZSB]{4}/g;
        const matches = text.toUpperCase().replace(/[^A-Z0-9]/g, '').match(plateRegex);
        return {
            isValid: !!matches && matches.length > 0,
            plates: matches || [],
        };
    }
}
exports.OCRService = OCRService;
//# sourceMappingURL=ocr.service.js.map