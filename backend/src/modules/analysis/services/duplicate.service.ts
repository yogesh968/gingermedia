import sharp from 'sharp';
import { prisma } from '../../../prisma/client';

export class DuplicateService {
  /**
   * Generates a simple perceptual hash (Average Hash) for the image.
   */
  async generateHash(imagePath: string): Promise<string> {
    const size = 8;
    const { data } = await sharp(imagePath)
      .grayscale()
      .resize(size, size, { fit: 'fill' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    const avg = sum / data.length;

    let hash = '';
    for (let i = 0; i < data.length; i++) {
      hash += data[i] >= avg ? '1' : '0';
    }

    // Convert binary string to hex for storage
    return BigInt('0b' + hash).toString(16).padStart(16, '0');
  }

  async findDuplicates(hash: string, currentMediaId: string) {
    const similar = await prisma.analysis.findFirst({
      where: {
        perceptualHash: hash,
        mediaId: { not: currentMediaId },
      },
    });

    return !!similar;
  }
}
