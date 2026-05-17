import { BlurService } from './services/blur.service';
import { BrightnessService } from './services/brightness.service';
import { OCRService } from './services/ocr.service';
import { DuplicateService } from './services/duplicate.service';
import { HeuristicsService } from './services/heuristics.service';
import { logger } from '../../config/logger';

export class AnalysisService {
  private blurService = new BlurService();
  private brightnessService = new BrightnessService();
  private ocrService = new OCRService();
  private duplicateService = new DuplicateService();
  private heuristicsService = new HeuristicsService();

  async runAllChecks(mediaId: string, imagePath: string) {
    logger.info({ mediaId }, 'Starting image analysis');

    const [blur, brightness, ocrText, heuristics, hash] = await Promise.all([
      this.blurService.detectBlur(imagePath),
      this.brightnessService.analyzeBrightness(imagePath),
      this.ocrService.extractText(imagePath),
      this.heuristicsService.analyze(imagePath),
      this.duplicateService.generateHash(imagePath),
    ]);

    const isDuplicate = await this.duplicateService.findDuplicates(hash, mediaId);
    const plateValidation = this.ocrService.validateIndianPlate(ocrText);

    const results = {
      blurScore: blur.score,
      blurConfidence: blur.confidence,
      brightnessScore: brightness.score,
      isDuplicate,
      perceptualHash: hash,
      ocrResult: ocrText,
      plateNumber: plateValidation.plates[0] || null,
      isPlateValid: plateValidation.isValid,
      isScreenshot: heuristics.isScreenshot,
      isTampered: heuristics.isTampered,
      dimensions: heuristics.dimensions,
      rawResult: {
        heuristics,
        brightness,
        blur,
        plateValidation,
      }
    };

    logger.info({ mediaId }, 'Image analysis completed');
    return results;
  }
}
