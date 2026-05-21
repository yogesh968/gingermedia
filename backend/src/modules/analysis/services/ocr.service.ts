import { createWorker, PSM } from 'tesseract.js';
import { logger } from '../../../config/logger';
import os from 'os';

export class OCRService {
  async extractText(imagePath: string): Promise<string> {
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker('eng', 1, {
        langPath: os.tmpdir(),
        cacheMethod: 'readOnly',
      });
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      });
      const { data: { text } } = await worker.recognize(imagePath);
      return text.trim();
    } catch (error) {
      logger.error(error, 'OCR Extraction failed');
      return '';
    } finally {
      if (worker) {
        try { await worker.terminate(); } catch (_) {}
      }
    }
  }

  validateIndianPlate(text: string) {
    const plateRegex = /[A-Z]{2}[0-9OIQ]{1,2}[A-Z0-9]{1,3}[0-9OIZSB]{4}/g;
    const matches = text.toUpperCase().replace(/[^A-Z0-9]/g, '').match(plateRegex);
    return {
      isValid: !!matches && matches.length > 0,
      plates: matches || [],
    };
  }
}
