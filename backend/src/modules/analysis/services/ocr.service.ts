import { createWorker, PSM } from 'tesseract.js';
import { logger } from '../../../config/logger';
import os from 'os';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export class OCRService {

  /**
   * Preprocess image with Sharp to significantly improve OCR accuracy:
   * - Convert to grayscale
   * - Upscale to at least 1200px wide (Tesseract works best on larger images)
   * - Apply sharpening and normalise contrast
   * - Save as PNG (lossless) to avoid JPEG artefacts hurting OCR
   */
  private async preprocessForOCR(imagePath: string): Promise<string> {
    const outPath = imagePath + '_ocr_preprocessed.png';
    try {
      const meta = await sharp(imagePath).metadata();
      const width = meta.width || 800;
      // Upscale to at least 2000px wide for small number plates
      const targetWidth = Math.max(2000, width * 2);

      await sharp(imagePath)
        .resize(targetWidth, null, { withoutEnlargement: false })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.5, m1: 1.0, m2: 2.0 })
        .png()
        .toFile(outPath);
      return outPath;
    } catch (err) {
      logger.warn(err, 'OCR preprocessing failed, using original image');
      return imagePath;
    }
  }

  async extractText(imagePath: string): Promise<string> {
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    let preprocessedPath: string | null = null;

    try {
      // Preprocess image before OCR for much better accuracy
      preprocessedPath = await this.preprocessForOCR(imagePath);

      const tmpDir = os.tmpdir();

      // Try to copy bundled eng.traineddata to /tmp if present
      const possibleSources = [
        path.join(process.cwd(), 'eng.traineddata'),
        path.join(__dirname, '../../../../eng.traineddata'),
        path.join(__dirname, '../../../../../eng.traineddata'),
      ];
      const tmpDataPath = path.join(tmpDir, 'eng.traineddata');

      if (!fs.existsSync(tmpDataPath)) {
        for (const src of possibleSources) {
          if (fs.existsSync(src)) {
            logger.info(`Copying eng.traineddata from ${src} to ${tmpDataPath}`);
            fs.copyFileSync(src, tmpDataPath);
            break;
          }
        }
      }

      const dataExists = fs.existsSync(tmpDataPath);
      logger.info({ dataExists, tmpDataPath }, 'Tesseract data path status');

      // Use 'write' so Tesseract can download from CDN if not bundled
      worker = await createWorker('eng', 1, {
        langPath: tmpDir,
        cacheMethod: dataExists ? 'readOnly' : 'write',
      });

      // Run OCR with multiple PSM modes and pick the best result
      const results: string[] = [];

      const modes = [PSM.SPARSE_TEXT, PSM.AUTO, PSM.SINGLE_LINE];
      for (const mode of modes) {
        await worker.setParameters({ tessedit_pageseg_mode: mode });
        const { data: { text } } = await worker.recognize(preprocessedPath);
        const trimmed = text.trim();
        if (trimmed.length > 0) results.push(trimmed);
      }

      // Return the longest text found across all modes (most characters detected)
      const bestResult = results.sort((a, b) => b.length - a.length)[0] || '';
      logger.info({ bestResult, modesTriedCount: modes.length }, 'OCR result');
      return bestResult;

    } catch (error) {
      logger.error(error, 'OCR Extraction failed');
      return '';
    } finally {
      if (worker) {
        try { await worker.terminate(); } catch (_) {}
      }
      // Cleanup preprocessed temp file
      if (preprocessedPath && preprocessedPath !== imagePath && fs.existsSync(preprocessedPath)) {
        try { fs.unlinkSync(preprocessedPath); } catch (_) {}
      }
    }
  }

  validateIndianPlate(text: string) {
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
