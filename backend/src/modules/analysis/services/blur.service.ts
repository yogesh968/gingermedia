import sharp from 'sharp';

export class BlurService {
  /**
   * Detects blur using Laplacian variance heuristic.
   * Higher variance = sharper image.
   * Lower variance = blurrier image.
   */
  async detectBlur(imagePath: string) {
    // Apply Laplacian filter to highlight edges
    // Standard Laplacian kernel: [0, 1, 0], [1, -4, 1], [0, 1, 0]
    const laplacianKernel = {
      width: 3,
      height: 3,
      kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
    };

    const { channels } = await sharp(imagePath)
      .grayscale()
      .convolve(laplacianKernel)
      .stats();

    // The variance of the Laplacian is a standard measure of focus/blur
    // Sharpness is proportional to the standard deviation of the Laplacian-filtered image
    const stdev = channels[0].stdev;
    const variance = stdev * stdev;

    // Thresholds (empirical):
    // < 100: Very blurry
    // 100-500: Low quality
    // > 1000: Sharp
    const confidence = Math.min(variance / 2000, 1.0);

    return {
      score: variance,
      confidence,
      isBlurry: variance < 500,
    };
  }
}
