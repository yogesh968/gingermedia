import { BlurService } from './blur.service';
import sharp from 'sharp';

// Mock sharp
jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    grayscale: jest.fn().mockReturnThis(),
    convolve: jest.fn().mockReturnThis(),
    stats: jest.fn().mockResolvedValue({
      channels: [{ stdev: 50 }]
    })
  }));
});

describe('BlurService', () => {
  let blurService: BlurService;

  beforeEach(() => {
    blurService = new BlurService();
  });

  it('should detect blur correctly', async () => {
    const result = await blurService.detectBlur('dummy.jpg');
    expect(result.score).toBe(2500); // 50 * 50
    expect(result.isBlurry).toBe(false);
  });
});
