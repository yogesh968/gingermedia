import sharp from 'sharp';

export class BrightnessService {
  /**
   * Analyzes image brightness.
   * Return score (0-255).
   */
  async analyzeBrightness(imagePath: string) {
    const { channels } = await sharp(imagePath)
      .grayscale()
      .stats();

    const meanBrightness = channels[0].mean;

    // Heuristics:
    // < 40: Low light / Dark
    // > 220: Overexposed
    return {
      score: meanBrightness,
      isLowLight: meanBrightness < 50,
      isOverexposed: meanBrightness > 220,
    };
  }
}
