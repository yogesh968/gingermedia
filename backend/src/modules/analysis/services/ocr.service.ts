import { createWorker } from 'tesseract.js';
import { logger } from '../../../config/logger';

export class OCRService {
  async extractText(imagePath: string): Promise<string> {
    const worker = await createWorker('eng');
    try {
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
    // Regex for Indian Plate formats: MH12AB1234, DL01C4321, etc.
    // Standard: 2 letters, 2 digits, 1 or 2 letters, 4 digits
    const plateRegex = /[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}/g;
    const matches = text.toUpperCase().replace(/[^A-Z0-9]/g, '').match(plateRegex);
    
    return {
      isValid: !!matches && matches.length > 0,
      plates: matches || [],
    };
  }
}
