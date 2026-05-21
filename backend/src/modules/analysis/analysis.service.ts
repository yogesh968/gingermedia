import { BlurService } from './services/blur.service';
import { BrightnessService } from './services/brightness.service';
import { OCRService } from './services/ocr.service';
import { DuplicateService } from './services/duplicate.service';
import { HeuristicsService } from './services/heuristics.service';
import { logger } from '../../config/logger';

// Wraps a promise with a timeout. If it times out, returns the fallback value.
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      logger.warn(`Analysis step timed out after ${ms}ms, using fallback`);
      resolve(fallback);
    }, ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); logger.error(err, 'Analysis step failed, using fallback'); resolve(fallback); }
    );
  });
}

export class AnalysisService {
  private blurService = new BlurService();
  private brightnessService = new BrightnessService();
  private ocrService = new OCRService();
  private duplicateService = new DuplicateService();
  private heuristicsService = new HeuristicsService();

  async runAllChecks(mediaId: string, imagePath: string) {
    logger.info({ mediaId }, 'Starting image analysis with per-step timeouts');

    const STEP_TIMEOUT_MS = 20000; // 20s per step

    const blurFallback = { score: 0, confidence: 0, isBlurry: false };
    const brightnessFallback = { score: 128, isLowLight: false, isOverexposed: false };
    const ocrFallback = '';
    const heuristicsFallback = { dimensions: { width: 0, height: 0 }, isScreenshot: false, isTampered: false, format: undefined as any, aspectRatio: 1, qualityThresholdMet: false };
    const hashFallback = '0000000000000000';

    // Run all steps in parallel, each with independent timeout + error handling
    const [blur, brightness, ocrText, heuristics, hash] = await Promise.all([
      withTimeout(this.blurService.detectBlur(imagePath), STEP_TIMEOUT_MS, blurFallback),
      withTimeout(this.brightnessService.analyzeBrightness(imagePath), STEP_TIMEOUT_MS, brightnessFallback),
      withTimeout(this.ocrService.extractText(imagePath), 25000, ocrFallback), // OCR gets 25s
      withTimeout(this.heuristicsService.analyze(imagePath), STEP_TIMEOUT_MS, heuristicsFallback),
      withTimeout(this.duplicateService.generateHash(imagePath), STEP_TIMEOUT_MS, hashFallback),
    ]);

    const isDuplicate = await withTimeout(
      this.duplicateService.findDuplicates(hash, mediaId),
      5000,
      false
    );
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
