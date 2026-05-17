"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateService = void 0;
const sharp_1 = __importDefault(require("sharp"));
const client_1 = require("../../../prisma/client");
class DuplicateService {
    /**
     * Generates a simple perceptual hash (Average Hash) for the image.
     */
    async generateHash(imagePath) {
        const size = 8;
        const { data } = await (0, sharp_1.default)(imagePath)
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
    async findDuplicates(hash, currentMediaId) {
        const similar = await client_1.prisma.analysis.findFirst({
            where: {
                perceptualHash: hash,
                mediaId: { not: currentMediaId },
            },
        });
        return !!similar;
    }
}
exports.DuplicateService = DuplicateService;
//# sourceMappingURL=duplicate.service.js.map