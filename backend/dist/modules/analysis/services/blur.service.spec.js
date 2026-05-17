"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const blur_service_1 = require("./blur.service");
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
    let blurService;
    beforeEach(() => {
        blurService = new blur_service_1.BlurService();
    });
    it('should detect blur correctly', async () => {
        const result = await blurService.detectBlur('dummy.jpg');
        expect(result.score).toBe(2500); // 50 * 50
        expect(result.isBlurry).toBe(false);
    });
});
//# sourceMappingURL=blur.service.spec.js.map