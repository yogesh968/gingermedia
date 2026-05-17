import { createWorker, PSM } from 'tesseract.js';
import { logger } from '../../../config/logger';

export class OCRService {
  async extractText(imagePath: string): Promise<string> {
    const worker = await createWorker('eng');
    try {
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      });
      const { data: { text } } = await worker.recognize(imagePath);
      return text.trim();
    } catch (error) {
      logger.error(error, 'OCR Extraction failed');
      return '';
    } finally {
      await worker.terminate();
    }
  }

  validateIndianPlate(text: string) {
    // Regex for Indian Plate formats allowing OCR errors: MH12AB1234, DL01C4321
    // Allows 0 instead of Q/O in series, and letters instead of numbers in digits
    const plateRegex = /[A-Z]{2}[0-9OIQ]{1,2}[A-Z0-9]{1,3}[0-9OIZSB]{4}/g;
    const matches = text.toUpperCase().replace(/[^A-Z0-9]/g, '').match(plateRegex);
    
    return {
      isValid: !!matches && matches.length > 0,
      plates: matches || [],
    };
  }
}
