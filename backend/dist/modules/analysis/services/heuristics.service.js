"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeuristicsService = void 0;
const sharp_1 = __importDefault(require("sharp"));
class HeuristicsService {
    async analyze(imagePath) {
        const metadata = await (0, sharp_1.default)(imagePath).metadata();
        const { width = 0, height = 0, format, density, exif } = metadata;
        // A. Screenshot Detection
        const aspectRatio = height / width;
        const isMobilePortrait = aspectRatio > 1.7 && aspectRatio < 2.3; // e.g. 1080x2340, 1080x1920
        const isMobileLandscape = (1 / aspectRatio) > 1.7 && (1 / aspectRatio) < 2.3;
        // Heuristic: Status bar check (simplification: if aspect ratio is very high/low and dimensions match common phones)
        const isScreenshot = isMobilePortrait || isMobileLandscape;
        // B. Tampering Detection (Basic)
        // Check for editing software in EXIF or metadata
        const exifString = exif?.toString('utf-8') || '';
        const softwareTags = ['photoshop', 'gimp', 'picsart', 'snapseed', 'canva'];
        const suspiciousSoftware = softwareTags.some(tag => exifString.toLowerCase().includes(tag));
        // Compression artifacts heuristic (simplification: very low density or specific quantization tables if available)
        const isSuspicious = suspiciousSoftware || (density && density < 72);
        return {
            dimensions: { width, height },
            isScreenshot,
            isTampered: !!isSuspicious,
            format,
            aspectRatio,
            qualityThresholdMet: width >= 640 && height >= 480,
        };
    }
}
exports.HeuristicsService = HeuristicsService;
//# sourceMappingURL=heuristics.service.js.map