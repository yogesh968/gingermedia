export declare class OCRService {
    /**
     * Preprocess image with Sharp to significantly improve OCR accuracy:
     * - Convert to grayscale
     * - Upscale to at least 1200px wide (Tesseract works best on larger images)
     * - Apply sharpening and normalise contrast
     * - Save as PNG (lossless) to avoid JPEG artefacts hurting OCR
     */
    private preprocessForOCR;
    extractText(imagePath: string): Promise<string>;
    validateIndianPlate(text: string): {
        isValid: boolean;
        plates: never[];
    } | {
        isValid: boolean;
        plates: [] | RegExpMatchArray;
    };
}
