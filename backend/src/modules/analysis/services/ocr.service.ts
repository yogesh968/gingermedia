import axios from 'axios';
import { logger } from '../../../config/logger';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

export class OCRService {

  /**
   * Preprocess image with Sharp to significantly improve OCR accuracy.
   * Upscale, grayscale, normalize contrast, sharpen, output as PNG.
   */
  private async preprocessForOCR(imagePath: string): Promise<Buffer> {
    try {
      const meta = await sharp(imagePath).metadata();
      const width = meta.width || 800;
      const targetWidth = Math.max(2000, width * 2);

      return await sharp(imagePath)
        .resize(targetWidth, null, { withoutEnlargement: false })
        .grayscale()
        .normalize()
        .sharpen({ sigma: 1.5, m1: 1.0, m2: 2.0 })
        .png()
        .toBuffer();
    } catch (err) {
      logger.warn(err, 'OCR preprocessing failed, using original image');
      return fs.readFileSync(imagePath);
    }
  }

  async extractText(imagePath: string): Promise<string> {
    try {
      // Preprocess for much better accuracy
      const imageBuffer = await this.preprocessForOCR(imagePath);
      const base64 = imageBuffer.toString('base64');

      // OCR.space free API - reliable HTTP-based OCR, works on Vercel serverless
      const apiKey = process.env.OCR_SPACE_API_KEY || 'helloworld';

      const formData = new URLSearchParams();
      formData.append('base64Image', `data:image/png;base64,${base64}`);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('OCREngine', '2');         // Engine 2 is best for printed/licence plate text
      formData.append('scale', 'true');           // Let OCR.space also scale internally
      formData.append('isTable', 'false');

      const response = await axios.post(
        'https://api.ocr.space/parse/image',
        formData.toString(),
        {
          headers: {
            apikey: apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 20000,
        }
      );

      const result = response.data;

      if (result?.IsErroredOnProcessing) {
        logger.error({ error: result.ErrorMessage }, 'OCR.space API error');
        return '';
      }

      if (result?.ParsedResults && result.ParsedResults.length > 0) {
        const text = result.ParsedResults[0].ParsedText || '';
        logger.info({ text }, 'OCR.space result');
        return text.trim();
      }

      return '';
    } catch (error) {
      logger.error(error, 'OCR Extraction failed');
      return '';
    }
  }

  validateIndianPlate(text: string) {
    if (!text || text.length === 0) {
      return { isValid: false, plates: [] };
    }

    const upper = text.toUpperCase();

    // Fix common OCR misreads for number plates
    const corrected = upper
      .replace(/\bO\b/g, '0')
      .replace(/(?<=[A-Z]{2}\d{1,2}[A-Z]{1,3})O/g, '0')
      .replace(/(?<=\d)O(?=\d)/g, '0')
      .replace(/(?<=\d)I(?=\d)/g, '1')
      .replace(/(?<=\d)S(?=\d)/g, '5')
      .replace(/(?<=\d)Z(?=\d)/g, '2')
      .replace(/(?<=\d)B(?=\d)/g, '8');

    // Clean to alphanumeric only
    const clean = corrected.replace(/[^A-Z0-9]/g, '');
    const cleanOriginal = upper.replace(/[^A-Z0-9]/g, '');

    // Standard Indian plate: MH12AB3456 or TN87C5106
    const strictRegex = /[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{4}/g;

    let matches: string[] | null = clean.match(strictRegex) || cleanOriginal.match(strictRegex);

    // Lenient fallback
    if (!matches || matches.length === 0) {
      const lenientRegex = /[A-Z]{2}[A-Z0-9]{1,6}\d{4}/g;
      matches = clean.match(lenientRegex) || cleanOriginal.match(lenientRegex) || null;
    }

    return {
      isValid: !!matches && matches.length > 0,
      plates: matches || [],
    };
  }
}
