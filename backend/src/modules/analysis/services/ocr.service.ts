import { createWorker, PSM } from 'tesseract.js';
import { logger } from '../../../config/logger';
import os from 'os';
import fs from 'fs';
import path from 'path';

export class OCRService {
  async extractText(imagePath: string): Promise<string> {
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      // Vercel Serverless Function compatibility:
      // We must trick NFT into bundling the file by using path.join(__dirname, ...)
      const sourceDataPath = path.join(process.cwd(), 'eng.traineddata');
      const fallbackDataPath = path.join(__dirname, '../../../../eng.traineddata');
      
      const tmpDir = os.tmpdir();
      const tmpDataPath = path.join(tmpDir, 'eng.traineddata');
      
      if (!fs.existsSync(tmpDataPath)) {
        if (fs.existsSync(sourceDataPath)) {
          fs.copyFileSync(sourceDataPath, tmpDataPath);
        } else if (fs.existsSync(fallbackDataPath)) {
          fs.copyFileSync(fallbackDataPath, tmpDataPath);
        } else {
          logger.warn('eng.traineddata not found in deployment! Tesseract will attempt to download it.');
        }
      }

      worker = await createWorker('eng', 1, {
        langPath: tmpDir,
        cacheMethod: fs.existsSync(tmpDataPath) ? 'readOnly' : 'write',
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
