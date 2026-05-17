"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrightnessService = void 0;
const sharp_1 = __importDefault(require("sharp"));
class BrightnessService {
    /**
     * Analyzes image brightness.
     * Return score (0-255).
     */
    async analyzeBrightness(imagePath) {
        const { channels } = await (0, sharp_1.default)(imagePath)
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
exports.BrightnessService = BrightnessService;
//# sourceMappingURL=brightness.service.js.map