"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OCRService = void 0;
const tesseract_js_1 = require("tesseract.js");
const logger_1 = require("../../../config/logger");
class OCRService {
    async extractText(imagePath) {
        const worker = await (0, tesseract_js_1.createWorker)('eng');
        try {
            const { data: { text } } = await worker.recognize(imagePath);
            return text.trim();
        }
        catch (error) {
            logger_1.logger.error(error, 'OCR Extraction failed');
            return '';
        }
        finally {
            await worker.terminate();
        }
    }
    validateIndianPlate(text) {
        // Regex for Indian Plate formats: MH12AB1234, DL01C4321, etc.
        // Standard: 2 letters, 2 digits, 1 or 2 letters, 4 digits
        const plateRegex = /[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}/g;
        const matches = text.toUpperCase().replace(/[^A-Z0-9]/g, '').match(plateRegex);
        return {
            isValid: !!matches && matches.length > 0,
            plates: matches || [],
        };
    }
}
exports.OCRService = OCRService;
//# sourceMappingURL=ocr.service.js.map